<div align="center">

  <!-- ANIMATED AUDIO WAVE VISUALIZER BANNER -->
  <img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-8417-6447c20bc9d0.gif" width="100%" height="8px" alt="animated divider" />
  
  <br /><br />

  <!-- ANIMATED TYPING SVG BANNER -->
  <a href="https://git.io/typing-svg">
    <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=28&pause=1000&color=FF0000&center=true&vCenter=true&random=false&width=750&height=50&lines=%F0%9F%8E%B5+YouTube+Music+Scraper+%26+REST+API;%F0%9F%8E%A7+Zero-Redirect+Direct+Audio+Proxy;%F0%9F%93%9C+Dual+Lyrics%3A+Official+%2B+Synced+Karaoke;%E2%9A%A1+2-in-1+Hybrid+Engine+(REST+API+%2B+CLI)" alt="Typing SVG" />
  </a>

  <br />

  <!-- BADGES WITH ANIMATED STYLING -->
  <p align="center">
    <a href="#"><img src="https://img.shields.io/badge/Node.js-v18%2B-green.svg?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="NodeJS" /></a>
    <a href="#"><img src="https://img.shields.io/badge/Platform-YouTube%20Music-red.svg?style=for-the-badge&logo=youtubemusic&logoColor=white" alt="YouTube Music" /></a>
    <a href="#"><img src="https://img.shields.io/badge/Lyrics-LyricFind%20%7C%20LRCLIB-violet.svg?style=for-the-badge&logo=genius&logoColor=white" alt="Lyrics Engine" /></a>
    <a href="#"><img src="https://img.shields.io/badge/Proxy-Zero%20Redirect-orange.svg?style=for-the-badge&logo=fastapi&logoColor=white" alt="Proxy" /></a>
    <a href="#"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="License" /></a>
  </p>

  <p align="center">
    <b>Solusi Scraper & REST API Server Audio Streaming Modern, Cepat, dan Privat Berbasis Node.js</b>
  </p>

  <img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-8417-6447c20bc9d0.gif" width="100%" height="8px" alt="animated divider" />

</div>

<br />

## 🌟 Highlighting Features

<div align="center">
  <img src="https://github.com/user-attachments/assets/5c0ee1fd-1647-4927-a068-07b9264c9bc0" width="400" alt="Audio Visualizer Animation" />
</div>

| Fitur | Deskripsi |
| :--- | :--- |
| ⚡ **2-in-1 Hybrid Mode** | Berjalan fleksibel sebagai **REST API Web Server** (Port 3000) **DAN** sebagai **CLI Tool** langsung di terminal. |
| 🎧 **Zero-Redirect Proxy** | Server proxy stream lokal (`/stream/:videoId`) menyalurkan audio mentah tanpa redirect & **100% menyamarkan IP**. |
| 📜 **Dual Lyrics Engine** | **Official YTM Lyrics** (*LyricFind / Musixmatch*) + **Synced Karaoke Lyrics** ber-timestamp milidetik (*LRCLIB*). |
| 🔍 **Full Exploration** | Pencarian Kata Kunci (*Search*), Beranda Rekomendasi (*Home*), & Top Charts (*Trending*). |
| 📁 **Metadata Kompleks** | Detail Artis (Profil & Top Songs), Album (Tracklist lengkap), dan Playlist dengan `streamUrl` langsung di tiap lagu. |
| 🌐 **Full CORS Enabled** | Siap diintegrasikan langsung dengan aplikasi Web/Mobile (React, Vue, Next.js, Flutter, HTML/JS) tanpa error CORS. |

---

## ⚡ Quick Start & Installation

```bash
# 1. Clone repository
git clone https://github.com/lannreal/turuajakaliyak.git

# 2. Masuk ke folder proyek
cd turuajakaliyak

# 3. Install dependensi
npm install

# 4. Jalankan Server REST API Interaktif (Port 3000)
node index.js server 3000
```

---

## 📡 REST API Documentation

Jalankan server REST API dengan `node index.js server 3000`, lalu tembak endpoint berikut dari Browser, Postman, atau Frontend App Anda:

```http
GET http://127.0.0.1:3000/
```

### 📋 List Endpoints

| Method | Endpoint Path | Fungsi & Parameter |
| :---: | :--- | :--- |
| `GET` | `/` | Dokumentasi & Status Live Server REST API |
| `GET` | `/api/search?q=<query>&page=1` | Cari lagu, artis, atau album (`q=home` / `q=trending`) |
| `GET` | `/api/song/:videoId` | Detail lagu, audio specs, lirik ganda, & related songs |
| `GET` | `/api/artist/:artistId` | Profil artis, 10 top songs (ada `streamUrl`), & albums |
| `GET` | `/api/album/:albumId` | Detail album & seluruh trek lagu (ada `streamUrl`) |
| `GET` | `/api/playlist/:playlistId` | Detail playlist & seluruh trek lagu (ada `streamUrl`) |
| `GET` | `/api/home?page=1` | Beranda Rekomendasi YouTube Music |
| `GET` | `/api/trending?page=1` | Top Charts Trending YouTube Music |
| `GET` | `/stream/:videoId` | **Direct Audio Stream Proxy** (Audio Player Endpoint) |

---

## 💻 CLI (Command Line Interface) Usage

<details>
<summary>▶️ <b>Klik di sini untuk melihat Panduan Perintah CLI Terminal</b></summary>

<br />

```bash
# 1. Jalankan REST API Server
node index.js server 3000

# 2. Ambil detail lagu, lirik, & stream URL
node index.js song k1BfsO0mxWQ

# 3. Cari lagu / artis / album
node index.js search "Sheila on 7" 1

# 4. Lihat rekomendasi beranda
node index.js home

# 5. Lihat profil artis & top songs
node index.js artist UCoy8sTKrImqfSq6TYOSW81A

# 6. Lihat tracklist album
node index.js album MPREb_N8YZSqmQiv4

# 7. Lihat tracklist playlist
node index.js playlist PL3LUUT1_qZN5G6hOlPm64aCe6A3yIwZKh

# 8. Lihat lagu trending saat ini
node index.js trending
```

#### Flags Opsional:
- `--port 8080` : Mengubah port server ke `8080`.
- `--out file.json` : Menyimpan output JSON CLI ke file kustom.

</details>

---

## 📄 Sample JSON Payload (`GET /api/song/k1BfsO0mxWQ`)

<details>
<summary>🔍 <b>Klik untuk melihat Struktur JSON Lengkap</b></summary>

<br />

```json
{
  "status": "success",
  "command": "song",
  "type": "song",
  "data": {
    "id": "k1BfsO0mxWQ",
    "title": "Dan...",
    "artist": "Sheila On 7",
    "duration": "4:49",
    "durationSeconds": 289,
    "views": 55408789,
    "coverArt": "https://yt3.googleusercontent.com/...",
    "webUrl": "https://music.youtube.com/watch?v=k1BfsO0mxWQ",
    "streamUrl": "http://127.0.0.1:3000/stream/k1BfsO0mxWQ",
    "audioQuality": {
      "container": "audio/mp4",
      "codec": "mp4a.40.2",
      "bitrate": "131 kbps",
      "sampleRate": "44100 Hz"
    },
    "lyrics": {
      "hasOfficial": true,
      "hasSynced": true,
      "official": {
        "source": "Source: LyricFind",
        "lines": [
          "Dan bila esok datang kembali",
          "Maafkan aku"
        ]
      },
      "synced": [
        {
          "time": "00:19.04",
          "seconds": 19.04,
          "text": "Dan bila esok datang kembali"
        }
      ]
    },
    "relatedSongs": [
      {
        "type": "song",
        "id": "hv00T3jdIhc",
        "title": "Kita",
        "artist": "Sheila On 7",
        "streamUrl": "http://127.0.0.1:3000/stream/hv00T3jdIhc"
      }
    ]
  }
}
```

</details>

---

## 🌐 Data Sources & Credits

- 🎶 **Metadata, Search & Audio Stream**: [YouTube Music](https://music.youtube.com)
- 🎤 **Official Lyrics Provider**: LyricFind / Musixmatch (via YouTube Music)
- ⏱️ **Synced Timestamps Lyrics**: [LRCLIB](https://lrclib.net)

---

<div align="center">
  <img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-8417-6447c20bc9d0.gif" width="100%" height="8px" alt="animated divider" />
  <br />
  <sub>Built with ❤️ & Node.js — Distributed under the <b>MIT License</b></sub>
</div>
