const fs = require("fs");
const path = require("path");
const http = require("http");
const url = require("url");
const net = require("net");
const { exec, execSync } = require("child_process");
const YTMusic = require("ytmusic-api").default || require("ytmusic-api");
const { Innertube } = require("youtubei.js");

let PROXY_PORT = 3000;
let ALIAS_BASE_URL = `http://127.0.0.1:${PROXY_PORT}`;

/**
 * Cek apakah Port Proxy/Server sedang aktif
 */
function isPortActive(port) {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(150);
        socket.on("connect", () => {
            socket.destroy();
            resolve(true);
        });
        socket.on("timeout", () => {
            socket.destroy();
            resolve(false);
        });
        socket.on("error", () => {
            socket.destroy();
            resolve(false);
        });
        socket.connect(port, "127.0.0.1");
    });
}

/**
 * Otomatis spawn background process untuk Server API jika belum berjalan
 */
function ensureProxyServerRunning(port) {
    isPortActive(port).then((active) => {
        if (!active) {
            try {
                if (process.platform === "win32") {
                    exec(`start /b "" "${process.execPath}" "${__filename}" server ${port}`);
                } else {
                    const { spawn } = require("child_process");
                    const child = spawn(process.execPath, [__filename, "server", port.toString()], {
                        detached: true,
                        stdio: "ignore"
                    });
                    child.unref();
                }
            } catch (e) { }
        }
    }).catch(() => { });
}

/**
 * Helper anti-403 Access Denied untuk mengekstrak Raw Deciphered Stream URL (.googlevideo.com)
 */
async function getRawDecipheredUrl(videoId) {
    if (!videoId) return null;
    let rawUrl = null;

    // 1. Coba dekripsi via Innertube (youtubei.js)
    try {
        const yt = await Innertube.create();
        const songInfo = await yt.music.getInfo(videoId);
        const format = songInfo.chooseFormat({ type: "audio", quality: "best" });
        if (format) {
            if (format.url) {
                rawUrl = format.url;
            } else if (typeof format.decipher === "function" && yt.session && yt.session.player) {
                rawUrl = format.decipher(yt.session.player);
            } else {
                const cipherParams = new URLSearchParams(format.signature_cipher || format.cipher);
                rawUrl = cipherParams.get("url") || null;
            }
        }
    } catch (e) { }

    // 2. Fallback via yt-dlp jika Innertube menemui kendala
    if (!rawUrl) {
        try {
            const cmd = `yt-dlp --no-update -g -f bestaudio "https://music.youtube.com/watch?v=${videoId}"`;
            const output = execSync(cmd, { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
            const lines = output.split(/\r?\n/).filter(l => l.startsWith("http"));
            if (lines.length > 0) rawUrl = lines[lines.length - 1];
        } catch (e) { }
    }

    return rawUrl;
}

/**
 * Pembersih judul dan nama artis pintar
 */
function cleanTitleAndArtist(rawTitle, rawArtist) {
    let cleanTitle = rawTitle || "";
    let cleanArtist = rawArtist || "";

    cleanTitle = cleanTitle
        .replace(/\(lyrics\)/i, "")
        .replace(/\[lyrics\]/i, "")
        .replace(/\(official audio\)/i, "")
        .replace(/\(official music video\)/i, "")
        .replace(/\(official video\)/i, "")
        .replace(/\(audio\)/i, "")
        .trim();

    if (cleanTitle.includes("-")) {
        const parts = cleanTitle.split("-");
        cleanArtist = parts[0].trim();
        cleanTitle = parts.slice(1).join("-").trim();
    }

    return { title: cleanTitle, artist: cleanArtist };
}

/**
 * Helper Lirik Resmi YouTube Music (LyricFind/Musixmatch)
 */
async function getOfficialYTMusicLyrics(videoId, ytmusic, yt) {
    let lines = null;
    let provider = "YouTube Music (LyricFind / Musixmatch)";

    try {
        const lyricsObj = await yt.music.getLyrics(videoId);
        if (lyricsObj && lyricsObj.description && lyricsObj.description.text) {
            lines = lyricsObj.description.text.split("\n");
        }
        if (lyricsObj && lyricsObj.footer && lyricsObj.footer.text) {
            provider = lyricsObj.footer.text;
        }
    } catch (e) {
        try {
            lines = await ytmusic.getLyrics(videoId);
        } catch (err) { }
    }

    if (!lines) return null;

    return {
        source: provider,
        lines: lines
    };
}

/**
 * Helper Lirik Tersinkronisasi Timestamp (LRCLIB)
 */
async function getSyncedLyrics(rawTitle, rawArtist) {
    const { title, artist } = cleanTitleAndArtist(rawTitle, rawArtist);
    if (!title) return null;

    const queryCandidates = [
        { t: title, a: artist },
        { t: title.replace(/\.+$/, "").trim(), a: artist },
        { t: title.replace(/[^\w\s]/gi, "").trim(), a: artist }
    ];

    for (const q of queryCandidates) {
        try {
            const searchUrl = `https://lrclib.net/api/get?track_name=${encodeURIComponent(q.t)}&artist_name=${encodeURIComponent(q.a || "")}`;
            const res = await fetch(searchUrl);
            if (res.ok) {
                const data = await res.json();
                if (data.syncedLyrics) {
                    const rawLines = data.syncedLyrics.split(/\r?\n/).filter(l => l.trim());
                    return rawLines.map(line => {
                        const match = line.match(/^\[(\d{2}):(\d{2}\.\d{2})\]\s*(.*)$/);
                        if (match) {
                            const mins = parseInt(match[1]);
                            const secs = parseFloat(match[2]);
                            const totalSeconds = Math.round((mins * 60 + secs) * 100) / 100;
                            return {
                                time: `${match[1]}:${match[2]}`,
                                seconds: totalSeconds,
                                text: match[3]
                            };
                        }
                        return { text: line };
                    });
                }
            }
        } catch (e) { }
    }

    return null;
}

/**
 * Helper Cover Art
 */
function getBestCover(thumbnails) {
    if (!thumbnails || !Array.isArray(thumbnails) || thumbnails.length === 0) return null;
    const sorted = [...thumbnails].sort((a, b) => (b.width || 0) - (a.width || 0));
    return sorted[0].url;
}

/**
 * Format Item Rapi & Logis
 */
function formatItem(item) {
    const type = item.videoId ? "song" : (item.artistId ? "artist" : (item.albumId ? "album" : (item.playlistId ? "playlist" : "item")));
    const title = item.title || item.name || null;
    const id = item.videoId || item.artistId || item.albumId || item.playlistId || null;

    let artistName = null;
    if (item.artists && Array.isArray(item.artists) && item.artists.length > 0) {
        const validArtists = item.artists.map(a => typeof a === "object" ? a.name : a).filter(a => a && typeof a === "string" && !/^\d+:\d{2}$/.test(a));
        if (validArtists.length > 0) artistName = validArtists.join(", ");
    }
    
    if (!artistName && item.artist) {
        let str = typeof item.artist === "object" ? (item.artist.name || item.artist.title) : item.artist;
        if (str && typeof str === "string" && !/^\d+:\d{2}$/.test(str)) {
            artistName = str;
        }
    }

    if (!artistName && item.author) {
        let str = typeof item.author === "object" ? item.author.name : item.author;
        if (str && typeof str === "string" && !/^\d+:\d{2}$/.test(str)) {
            artistName = str;
        }
    }

    let durationStr = null;
    if (item.duration) {
        if (typeof item.duration === "number") {
            const mins = Math.floor(item.duration / 60);
            const secs = item.duration % 60;
            durationStr = `${mins}:${secs.toString().padStart(2, '0')}`;
        } else if (typeof item.duration === "string") {
            durationStr = item.duration;
        }
    }

    const obj = {
        type: type,
        id: id,
        title: title
    };

    if (artistName) obj.artist = artistName;
    if (item.album) obj.album = typeof item.album === "object" ? item.album.name : item.album;
    if (durationStr) obj.duration = durationStr;

    const cover = getBestCover(item.thumbnails);
    if (cover) obj.coverArt = cover;

    if (item.videoId) {
        obj.webUrl = `https://music.youtube.com/watch?v=${item.videoId}`;
        obj.streamUrl = `${ALIAS_BASE_URL}/stream/${item.videoId}`;
    } else if (item.artistId) {
        obj.webUrl = `https://music.youtube.com/channel/${item.artistId}`;
    } else if (item.albumId) {
        obj.webUrl = `https://music.youtube.com/browse/${item.albumId}`;
    } else if (item.playlistId) {
        obj.webUrl = `https://music.youtube.com/playlist?list=${item.playlistId}`;
    }

    return obj;
}

/**
 * Deteksi Jenis ID secara Otomatis
 */
function detectIdType(id) {
    if (!id) return "song";
    if (id.startsWith("UC") || id.startsWith("channel/")) return "artist";
    if (id.startsWith("MPREb") || id.startsWith("browse/")) return "album";
    if (id.startsWith("VL") || id.startsWith("PL") || id.startsWith("RD") || id.includes("playlist")) return "playlist";
    return "song";
}

// -----------------------------------------------------------------------------
// CORE BUSINESS LOGIC SERVICE
// -----------------------------------------------------------------------------
async function fetchSongDetails(videoId, ytmusic) {
    const cleanId = videoId.replace(/^.*v=/, "");
    let yt = null;
    try {
        yt = await Innertube.create();
    } catch (e) {
        await new Promise(r => setTimeout(r, 300));
        yt = await Innertube.create();
    }

    let basicInfo = {};
    let selectedFormat = {};
    let recommendations = [];

    try {
        const musicInfo = await yt.music.getInfo(cleanId);
        basicInfo = musicInfo.basic_info || {};
        const format = musicInfo.chooseFormat({ type: "audio", quality: "best" });
        if (format) {
            selectedFormat = {
                container: format.mime_type ? format.mime_type.split(";")[0] : "audio/webm",
                codec: format.mime_type ? (format.mime_type.match(/codecs="([^"]+)"/) || [])[1] || "opus" : "opus",
                bitrate: format.bitrate ? `${Math.round(format.bitrate / 1000)} kbps` : "160 kbps",
                sampleRate: format.audio_sample_rate ? `${format.audio_sample_rate} Hz` : "48000 Hz"
            };
        }
    } catch (e) {
        try {
            const info = await yt.getInfo(cleanId);
            basicInfo = info.basic_info || {};
        } catch (err) {}
    }

    if (basicInfo.title) {
        try {
            const searchRes = await ytmusic.search(`${basicInfo.author || ''} ${basicInfo.title || ''}`);
            recommendations = searchRes.filter(i => i.videoId && i.videoId !== cleanId).slice(0, 5).map(i => formatItem(i));
        } catch (e) {}
    }

    const streamUrl = `${ALIAS_BASE_URL}/stream/${cleanId}`;
    const officialYtmLyrics = await getOfficialYTMusicLyrics(cleanId, ytmusic, yt);
    const syncedLyrics = await getSyncedLyrics(basicInfo.title, basicInfo.author);

    let formattedDuration = null;
    if (basicInfo.duration) {
        const mins = Math.floor(basicInfo.duration / 60);
        const secs = basicInfo.duration % 60;
        formattedDuration = `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    return {
        status: "success",
        command: "song",
        type: "song",
        data: {
            id: cleanId,
            title: basicInfo.title || null,
            artist: basicInfo.author || null,
            duration: formattedDuration,
            durationSeconds: basicInfo.duration || null,
            views: basicInfo.view_count || null,
            coverArt: getBestCover(basicInfo.thumbnail || []),
            webUrl: `https://music.youtube.com/watch?v=${cleanId}`,
            streamUrl: streamUrl,
            audioQuality: Object.keys(selectedFormat).length > 0 ? selectedFormat : {
                container: "audio/webm",
                codec: "opus",
                bitrate: "160 kbps",
                sampleRate: "48000 Hz"
            },
            lyrics: {
                hasOfficial: !!officialYtmLyrics,
                hasSynced: !!syncedLyrics,
                official: officialYtmLyrics,
                synced: syncedLyrics
            },
            relatedSongs: recommendations
        }
    };
}

async function fetchArtistDetails(artistId, ytmusic) {
    const cleanId = artistId.replace(/^.*channel\//, "");
    const artist = await ytmusic.getArtist(cleanId);
    return {
        status: "success",
        command: "artist",
        type: "artist",
        data: {
            id: cleanId,
            name: artist.name || null,
            webUrl: `https://music.youtube.com/channel/${cleanId}`,
            coverArt: getBestCover(artist.thumbnails),
            topSongs: (artist.songs || artist.topSongs || []).slice(0, 10).map(s => ({
                id: s.videoId || null,
                title: s.title || s.name,
                artist: artist.name || null,
                album: s.album ? (typeof s.album === "object" ? s.album.name : s.album) : null,
                duration: s.duration || null,
                coverArt: getBestCover(s.thumbnails),
                webUrl: s.videoId ? `https://music.youtube.com/watch?v=${s.videoId}` : null,
                streamUrl: s.videoId ? `${ALIAS_BASE_URL}/stream/${s.videoId}` : null
            })),
            albums: (artist.albums || []).slice(0, 5).map(a => ({
                id: a.albumId || null,
                title: a.title || a.name,
                year: a.year || null,
                coverArt: getBestCover(a.thumbnails),
                webUrl: a.albumId ? `https://music.youtube.com/browse/${a.albumId}` : null
            }))
        }
    };
}

async function fetchAlbumDetails(albumId, ytmusic) {
    const cleanId = albumId.replace(/^.*browse\//, "");
    const album = await ytmusic.getAlbum(cleanId);
    const tracks = (album.tracks || []).map((t, idx) => ({
        trackNumber: idx + 1,
        id: t.videoId || null,
        title: t.title || t.name,
        artist: album.artist ? (album.artist.name || album.artist) : null,
        duration: t.duration || null,
        webUrl: t.videoId ? `https://music.youtube.com/watch?v=${t.videoId}` : null,
        streamUrl: t.videoId ? `${ALIAS_BASE_URL}/stream/${t.videoId}` : null
    }));

    return {
        status: "success",
        command: "album",
        type: "album",
        data: {
            id: cleanId,
            title: album.name || album.title || null,
            artist: album.artist ? (album.artist.name || album.artist) : null,
            year: album.year || null,
            totalTracks: tracks.length,
            coverArt: getBestCover(album.thumbnails),
            webUrl: `https://music.youtube.com/browse/${cleanId}`,
            tracks: tracks
        }
    };
}

async function fetchPlaylistDetails(playlistId, ytmusic) {
    const cleanId = playlistId.replace(/^.*list=/, "");
    let tracks = [];
    let title = null;
    let author = null;
    let cover = null;

    try {
        const yt = await Innertube.create();
        const plInfo = await yt.getPlaylist(cleanId);
        title = plInfo.info ? plInfo.info.title : null;
        author = plInfo.info ? (plInfo.info.author ? plInfo.info.author.name : null) : null;
        cover = getBestCover(plInfo.info ? plInfo.info.thumbnails : []);

        if (plInfo.videos && Array.isArray(plInfo.videos)) {
            tracks = plInfo.videos.map((t, idx) => ({
                trackNumber: idx + 1,
                id: t.id || t.videoId || null,
                title: t.title ? (typeof t.title === 'object' ? t.title.text : t.title) : null,
                artist: t.author ? (typeof t.author === 'object' ? t.author.name : t.author) : null,
                duration: t.duration ? (typeof t.duration === 'object' ? t.duration.text : t.duration) : null,
                coverArt: getBestCover(t.thumbnails),
                webUrl: t.id ? `https://music.youtube.com/watch?v=${t.id}` : null,
                streamUrl: t.id ? `${ALIAS_BASE_URL}/stream/${t.id}` : null
            }));
        }
    } catch (e) {
        try {
            const playlist = await ytmusic.getPlaylist(cleanId);
            title = playlist.name || playlist.title || null;
            author = playlist.author ? (playlist.author.name || playlist.author) : null;
            cover = getBestCover(playlist.thumbnails);
            tracks = (playlist.tracks || playlist.items || []).map((t, idx) => ({
                trackNumber: idx + 1,
                id: t.videoId || null,
                title: t.title || t.name,
                artist: t.artists && Array.isArray(t.artists) ? t.artists.map(a => a.name).join(", ") : (t.artist || null),
                duration: t.duration || null,
                coverArt: getBestCover(t.thumbnails),
                webUrl: t.videoId ? `https://music.youtube.com/watch?v=${t.videoId}` : null,
                streamUrl: t.videoId ? `${ALIAS_BASE_URL}/stream/${t.videoId}` : null
            }));
        } catch (err) {}
    }

    return {
        status: "success",
        command: "playlist",
        type: "playlist",
        data: {
            id: cleanId,
            title: title,
            author: author,
            totalTracks: tracks.length,
            coverArt: cover,
            webUrl: `https://music.youtube.com/playlist?list=${cleanId}`,
            tracks: tracks
        }
    };
}

async function fetchSearchResults(query, page = 1, limit = 20, ytmusic) {
    if (query.toLowerCase() === "home") {
        const homeSections = await ytmusic.getHomeSections();
        let formattedSections = [];
        homeSections.forEach(section => {
            const title = section.title || "Recommendations";
            const contents = section.contents || section.items || [];
            if (contents.length > 0) {
                formattedSections.push({
                    sectionTitle: title,
                    items: contents.map(item => formatItem(item))
                });
            }
        });

        const totalSections = formattedSections.length;
        const totalPages = Math.ceil(totalSections / 3) || 1;
        const startIndex = (page - 1) * 3;
        const pageSections = formattedSections.slice(startIndex, startIndex + 3);

        return {
            status: "success",
            command: "search",
            mode: "home",
            page: page,
            totalPages: totalPages,
            totalSections: totalSections,
            data: pageSections
        };
    } else if (query.toLowerCase() === "trending" || query.toLowerCase() === "charts") {
        const rawResults = await ytmusic.search("Top Songs Indonesia Charts");
        const formattedResults = rawResults.map(item => formatItem(item));

        const totalItems = formattedResults.length;
        const totalPages = Math.ceil(totalItems / limit) || 1;
        const startIndex = (page - 1) * limit;
        const pageItems = formattedResults.slice(startIndex, startIndex + limit);

        return {
            status: "success",
            command: "trending",
            page: page,
            totalPages: totalPages,
            totalResults: totalItems,
            data: pageItems
        };
    } else {
        const rawResults = await ytmusic.search(query);
        const formattedResults = rawResults.map(item => formatItem(item));

        const totalItems = formattedResults.length;
        const totalPages = Math.ceil(totalItems / limit) || 1;
        const startIndex = (page - 1) * limit;
        const pageItems = formattedResults.slice(startIndex, startIndex + limit);

        return {
            status: "success",
            command: "search",
            query: query,
            page: page,
            totalPages: totalPages,
            totalResults: totalItems,
            data: pageItems
        };
    }
}

// -----------------------------------------------------------------------------
// FULL HYBRID REST API SERVER & STREAM PROXY
// -----------------------------------------------------------------------------
function startRestApiServer(port) {
    const serverPort = port || PROXY_PORT;
    const ytmusic = new YTMusic();

    let isInit = false;
    async function getYTInstance() {
        if (!isInit) {
            try {
                await ytmusic.initialize();
                isInit = true;
            } catch (e) {
                await new Promise(r => setTimeout(r, 300));
                await ytmusic.initialize();
                isInit = true;
            }
        }
        return ytmusic;
    }

    const server = http.createServer(async (req, res) => {
        // Headers CORS Universal & Anti-Block
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Range");

        if (req.method === "OPTIONS") {
            res.writeHead(204);
            res.end();
            return;
        }

        const parsedUrl = url.parse(req.url, true);
        const pathname = parsedUrl.pathname;
        const query = parsedUrl.query;

        // 1. ENDPOINT STREAM AUDIO ANTI-403: /stream/:videoId
        const streamMatch = pathname.match(/\/stream\/([a-zA-Z0-9_-]+)/);
        if (streamMatch) {
            const videoId = streamMatch[1];
            try {
                const rawUrl = await getRawDecipheredUrl(videoId);
                if (rawUrl) {
                    const fetchHeaders = {
                        "User-Agent": req.headers["user-agent"] || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                        "Referer": "https://music.youtube.com/"
                    };
                    if (req.headers.range) {
                        fetchHeaders["Range"] = req.headers.range;
                    }

                    const response = await fetch(rawUrl, { headers: fetchHeaders });
                    
                    const resHeaders = {
                        "Content-Type": response.headers.get("content-type") || "audio/webm",
                        "Accept-Ranges": "bytes",
                        "Cache-Control": "no-cache"
                    };

                    if (response.headers.get("content-length")) {
                        resHeaders["Content-Length"] = response.headers.get("content-length");
                    }
                    if (response.headers.get("content-range")) {
                        resHeaders["Content-Range"] = response.headers.get("content-range");
                    }

                    res.writeHead(response.status, resHeaders);

                    if (response.body) {
                        const reader = response.body.getReader();
                        while (true) {
                            const { done, value } = await reader.read();
                            if (done) break;
                            res.write(value);
                        }
                    }
                    res.end();
                } else {
                    res.writeHead(404, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ error: "Stream URL tidak ditemukan." }));
                }
            } catch (err) {
                if (!res.headersSent) {
                    res.writeHead(500, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ error: err.message }));
                }
            }
            return;
        }

        // Helper JSON Responder
        function sendJson(statusCode, data) {
            res.writeHead(statusCode, { "Content-Type": "application/json" });
            res.end(JSON.stringify(data, null, 2));
        }

        try {
            const ytInst = await getYTInstance();

            // 2. ENDPOINT SEARCH: /api/search?q=Sheila+on+7&page=1
            if (pathname === "/api/search") {
                const q = query.q || query.query || "Sheila on 7";
                const page = parseInt(query.page || 1);
                const result = await fetchSearchResults(q, page, 20, ytInst);
                return sendJson(200, result);
            }

            // 3. ENDPOINT SONG: /api/song/:id ATAU /api/song?id=...
            const songMatch = pathname.match(/\/api\/song\/([a-zA-Z0-9_-]+)/);
            if (songMatch || pathname === "/api/song") {
                const songId = songMatch ? songMatch[1] : (query.id || "k1BfsO0mxWQ");
                const result = await fetchSongDetails(songId, ytInst);
                return sendJson(200, result);
            }

            // 4. ENDPOINT ARTIST: /api/artist/:id ATAU /api/artist?id=...
            const artistMatch = pathname.match(/\/api\/artist\/([a-zA-Z0-9_-]+)/);
            if (artistMatch || pathname === "/api/artist") {
                const artistId = artistMatch ? artistMatch[1] : (query.id || "UCoy8sTKrImqfSq6TYOSW81A");
                const result = await fetchArtistDetails(artistId, ytInst);
                return sendJson(200, result);
            }

            // 5. ENDPOINT ALBUM: /api/album/:id ATAU /api/album?id=...
            const albumMatch = pathname.match(/\/api\/album\/([a-zA-Z0-9_-]+)/);
            if (albumMatch || pathname === "/api/album") {
                const albumId = albumMatch ? albumMatch[1] : (query.id || "MPREb_N8YZSqmQiv4");
                const result = await fetchAlbumDetails(albumId, ytInst);
                return sendJson(200, result);
            }

            // 6. ENDPOINT PLAYLIST: /api/playlist/:id ATAU /api/playlist?id=...
            const playlistMatch = pathname.match(/\/api\/playlist\/([a-zA-Z0-9_-]+)/);
            if (playlistMatch || pathname === "/api/playlist") {
                const playlistId = playlistMatch ? playlistMatch[1] : (query.id || "PL3LUUT1_qZN5G6hOlPm64aCe6A3yIwZKh");
                const result = await fetchPlaylistDetails(playlistId, ytInst);
                return sendJson(200, result);
            }

            // 7. ENDPOINT HOME: /api/home?page=1
            if (pathname === "/api/home") {
                const page = parseInt(query.page || 1);
                const result = await fetchSearchResults("home", page, 20, ytInst);
                return sendJson(200, result);
            }

            // 8. ENDPOINT TRENDING: /api/trending?page=1
            if (pathname === "/api/trending") {
                const page = parseInt(query.page || 1);
                const result = await fetchSearchResults("trending", page, 20, ytInst);
                return sendJson(200, result);
            }

            // 9. ROOT DOCUMENTATION & STATUS: /
            if (pathname === "/" || pathname === "/api") {
                return sendJson(200, {
                    status: "success",
                    server: "YouTube Music 2-in-1 Hybrid REST API & CLI",
                    version: "1.0.0",
                    port: serverPort,
                    endpoints: [
                        { method: "GET", path: "/api/search?q=Sheila+on+7&page=1", description: "Pencarian lagu/artis/album" },
                        { method: "GET", path: "/api/song/k1BfsO0mxWQ", description: "Detail lagu, audio specs, lirik & related" },
                        { method: "GET", path: "/api/artist/UCoy8sTKrImqfSq6TYOSW81A", description: "Profil artis & top songs" },
                        { method: "GET", path: "/api/album/MPREb_N8YZSqmQiv4", description: "Tracklist album" },
                        { method: "GET", path: "/api/playlist/PL3LUUT1_qZN5G6hOlPm64aCe6A3yIwZKh", description: "Tracklist playlist" },
                        { method: "GET", path: "/api/home?page=1", description: "Rekomendasi beranda" },
                        { method: "GET", path: "/api/trending?page=1", description: "Top charts trending" },
                        { method: "GET", path: "/stream/:videoId", description: "Audio stream direct proxy" }
                    ]
                });
            }

            return sendJson(404, { status: "error", message: `Endpoint '${pathname}' tidak ditemukan.` });

        } catch (err) {
            return sendJson(500, { status: "error", message: err.message });
        }
    });

    server.on("error", () => { });
    server.listen(serverPort, "0.0.0.0", () => {
        console.log(JSON.stringify({
            status: "running",
            message: `Server REST API YouTube Music aktif pada http://0.0.0.0:${serverPort}`,
            port: serverPort
        }, null, 2));
    });
}

// -----------------------------------------------------------------------------
// MAIN ENTRY POINT
// -----------------------------------------------------------------------------
async function main() {
    const rawArgs = process.argv.slice(2);

    let customPort = null;
    let customOutputFile = null;
    let args = [];

    for (let i = 0; i < rawArgs.length; i++) {
        if ((rawArgs[i] === "--port" || rawArgs[i] === "-p") && rawArgs[i + 1]) {
            customPort = parseInt(rawArgs[i + 1]);
            i++;
        } else if ((rawArgs[i] === "--out" || rawArgs[i] === "-o") && rawArgs[i + 1]) {
            customOutputFile = rawArgs[i + 1];
            i++;
        } else {
            args.push(rawArgs[i]);
        }
    }

    if (customPort) {
        PROXY_PORT = customPort;
        ALIAS_BASE_URL = `http://127.0.0.1:${PROXY_PORT}`;
    }

    if (args[0] === "server" || args[0] === "api" || args[0] === "start") {
        const portToUse = args[1] && !isNaN(args[1]) ? parseInt(args[1]) : PROXY_PORT;
        startRestApiServer(portToUse);
        return;
    }

    ensureProxyServerRunning(PROXY_PORT);

    if (args.length === 0 || args[0] === "--help" || args[0] === "-h" || args[0] === "help") {
        const helpJson = {
            status: "info",
            message: "YouTube Music Scraper & REST API 2-in-1 Hybrid",
            usage: "node index.js <command> [args]",
            commands: [
                {
                    command: "node index.js server [port]",
                    description: "Jalankan Server REST API Interaktif",
                    example: "node index.js server 3000"
                },
                {
                    command: "node index.js search <judul/artis>",
                    description: "Cari lagu, artis, atau album di CLI",
                    example: "node index.js search \"Sheila on 7\""
                },
                {
                    command: "node index.js song <videoId>",
                    description: "Ambil detail lagu, link audio stream, & lirik di CLI",
                    example: "node index.js song k1BfsO0mxWQ"
                },
                {
                    command: "node index.js home",
                    description: "Lihat beranda rekomendasi di CLI",
                    example: "node index.js home"
                },
                {
                    command: "node index.js artist <artistId>",
                    description: "Lihat profil artis di CLI",
                    example: "node index.js artist UCoy8sTKrImqfSq6TYOSW81A"
                },
                {
                    command: "node index.js album <albumId>",
                    description: "Lihat daftar lagu album di CLI",
                    example: "node index.js album MPREb_N8YZSqmQiv4"
                },
                {
                    command: "node index.js playlist <playlistId>",
                    description: "Lihat daftar lagu playlist di CLI",
                    example: "node index.js playlist PL3LUUT1_qZN5G6hOlPm64aCe6A3yIwZKh"
                }
            ]
        };
        console.log(JSON.stringify(helpJson, null, 2));
        return;
    }

    const command = args[0].toLowerCase();
    const limit = 20;

    let page = 1;
    const pageIdx = args.findIndex(a => a.toLowerCase() === "page");
    if (pageIdx !== -1 && args[pageIdx + 1] && !isNaN(args[pageIdx + 1])) {
        page = parseInt(args[pageIdx + 1]);
    } else if (args[2] && !isNaN(args[2])) {
        page = parseInt(args[2]);
    } else if (args[1] && !isNaN(args[1])) {
        page = parseInt(args[1]);
    }

    const ytmusic = new YTMusic();
    try {
        await ytmusic.initialize();
    } catch (e) {
        await new Promise(r => setTimeout(r, 300));
        await ytmusic.initialize();
    }

    let outputJson = {};

    if (command === "song" || (command === "get" && detectIdType(args[1]) === "song")) {
        const cleanId = args[1] || "k1BfsO0mxWQ";
        outputJson = await fetchSongDetails(cleanId, ytmusic);
    } else if (command === "artist" || (command === "info" && detectIdType(args[1]) === "artist")) {
        const cleanId = args[1] || "UCoy8sTKrImqfSq6TYOSW81A";
        outputJson = await fetchArtistDetails(cleanId, ytmusic);
    } else if (command === "album" || (command === "info" && detectIdType(args[1]) === "album")) {
        const cleanId = args[1] || "MPREb_N8YZSqmQiv4";
        outputJson = await fetchAlbumDetails(cleanId, ytmusic);
    } else if (command === "playlist" || (command === "info" && detectIdType(args[1]) === "playlist")) {
        const cleanId = args[1] || "PL3LUUT1_qZN5G6hOlPm64aCe6A3yIwZKh";
        outputJson = await fetchPlaylistDetails(cleanId, ytmusic);
    } else if (command === "home") {
        outputJson = await fetchSearchResults("home", page, 20, ytmusic);
    } else if (command === "trending") {
        outputJson = await fetchSearchResults("trending", page, 20, ytmusic);
    } else if (command === "search") {
        const query = args[1] || "Sheila on 7";
        outputJson = await fetchSearchResults(query, page, limit, ytmusic);
    } else {
        outputJson = {
            status: "error",
            message: `Command '${command}' tidak dikenal. Ketik 'node index.js' untuk melihat panduan.`
        };
    }

    const targetFile = customOutputFile ? path.resolve(customOutputFile) : path.join(__dirname, "output.json");
    fs.writeFileSync(targetFile, JSON.stringify(outputJson, null, 2), "utf-8");

    console.log(JSON.stringify(outputJson, null, 2));
}

main().catch(err => {
    console.error(JSON.stringify({ status: "error", message: err.message }, null, 2));
});
