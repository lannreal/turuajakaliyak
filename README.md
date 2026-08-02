<div align="center">

  <!-- ANIMATED AUDIO EQUALIZER SVG BAR -->
  <img src="https://raw.githubusercontent.com/andrei-pavel/andrei-pavel/main/assets/welcomes.gif" width="100%" height="8px" alt="animated divider" />
  
  <br /><br />

  <!-- ANIMATED TYPING SVG BANNER -->
  <a href="https://git.io/typing-svg">
    <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=26&pause=1000&color=E60000&center=true&vCenter=true&random=false&width=750&height=50&lines=%F0%9F%8E%B5+YouTube+Music+Scraper+%26+REST+API;%F0%9F%8E%A7+Zero-Redirect+Direct+Audio+Proxy;%F0%9F%93%9C+Dual+Lyrics%3A+Official+%2B+Synced+Karaoke;%F0%9F%9A%80+VPS%2FCloud+Deployment+Ready+(PM2%2FNginx);%F0%9F%93%B1+Termux+(Android)+%2B+Windows+Supported;%E2%9A%A1+2-in-1+Hybrid+Engine+(REST+API+%2B+CLI)" alt="Typing SVG" />
  </a>

  <br />

  <!-- BADGES WITH ANIMATED STYLING -->
  <p align="center">
    <a href="#"><img src="https://img.shields.io/badge/Node.js-v18%2B-green.svg?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="NodeJS" /></a>
    <a href="#"><img src="https://img.shields.io/badge/Platform-YouTube%20Music-red.svg?style=for-the-badge&logo=youtubemusic&logoColor=white" alt="YouTube Music" /></a>
    <a href="#"><img src="https://img.shields.io/badge/Lyrics-LyricFind%20%7C%20LRCLIB-violet.svg?style=for-the-badge&logo=genius&logoColor=white" alt="Lyrics Engine" /></a>
    <a href="#"><img src="https://img.shields.io/badge/Deployment-VPS%20%7C%20Cloud%20%7C%20Termux-orange.svg?style=for-the-badge&logo=nginx&logoColor=white" alt="Deployment" /></a>
    <a href="#"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="License" /></a>
  </p>

  <p align="center">
    <b>Solusi Scraper & REST API Server Audio Streaming Modern, Cepat, dan Privat Berbasis Node.js — Kompatibel Penuh untuk VPS, Server Cloud, Termux (Android), & PC</b>
  </p>

  <img src="https://raw.githubusercontent.com/andrei-pavel/andrei-pavel/main/assets/welcomes.gif" width="100%" height="8px" alt="animated divider" />

</div>

<br />

## 🌟 Fitur Utama

| Fitur | Deskripsi |
| :--- | :--- |
| ⚡ **2-in-1 Hybrid Mode** | Berjalan fleksibel sebagai **REST API Web Server** (Port 3000) **DAN** sebagai **CLI Tool** langsung di terminal. |
| 🚀 **VPS & Cloud Production Ready** | Siap dideploy 24/7 di VPS Linux (Ubuntu/Debian) menggunakan **PM2**, **Nginx Reverse Proxy**, & **SSL Certbot**. |
| 📱 **Full Termux (Android) Support** | Kompatibel 100% di Termux Android (`0.0.0.0` binding) dengan sistem dekripsi audio otomatis. |
| 🎧 **Zero-Redirect Proxy** | Server proxy stream lokal (`/stream/:videoId`) menyalurkan audio mentah tanpa redirect & **100% menyamarkan IP**. |
| 📜 **Dual Lyrics Engine** | **Official YTM Lyrics** (*LyricFind / Musixmatch*) + **Synced Karaoke Lyrics** ber-timestamp milidetik (*LRCLIB*). |
| 🔍 **Full Exploration** | Pencarian Kata Kunci (*Search*), Beranda Rekomendasi (*Home*), & Top Charts (*Trending*). |
| 📁 **Metadata Kompleks** | Detail Artis (Profil & Top Songs), Album (Tracklist lengkap), dan Playlist dengan `streamUrl` langsung di tiap lagu. |
| 🌐 **Full CORS Enabled** | Siap diintegrasikan langsung dengan aplikasi Web/Mobile (React, Vue, Next.js, Flutter, HTML/JS) tanpa error CORS. |

---

## ⚡ Quick Start & Lokal Setup

### 💻 1. Instalasi di Windows / Linux / macOS:
```bash
# 1. Clone repository
git clone https://github.com/lannreal/turuajakaliyak.git

# 2. Masuk ke folder proyek
cd turuajakaliyak

# 3. Install dependensi Node.js
npm install

# 4. Jalankan Server REST API Interaktif (Port 3000)
node index.js server 3000
```

---

### 📱 2. Panduan Khusus Termux (Android):
Untuk memastikan aliran audio stream terputar lancar 100% tanpa error 403 di Termux HP Android, install paket pendukung `yt-dlp` dan `ffmpeg` terlebih dahulu:

```bash
# 1. Update paket & install yt-dlp + ffmpeg di Termux
pkg install python ffmpeg -y && pip install yt-dlp

# 2. Clone repository & install dependensi
git clone https://github.com/lannreal/turuajakaliyak.git
cd turuajakaliyak
npm install

# 3. Jalankan Server REST API di Termux
node index.js server 3000
```

---

## 🚀 VPS & Cloud Server Deployment Guide

Ingin menjalankan REST API Server ini **24/7 di Cloud VPS** (Ubuntu/Debian) dengan domain kustom (`https://api.domain-anda.com`)? Ikuti langkah-langkah profesional berikut:

<details>
<summary>🌐 <b>Klik di sini untuk melihat Panduan Deploy VPS (Ubuntu/Debian + PM2 + Nginx)</b></summary>

<br />

### 1. Preparasi Sistem VPS (Ubuntu / Debian):
```bash
# Update sistem & install Node.js v18+, FFmpeg, Python & yt-dlp
sudo apt update && sudo apt upgrade -y
sudo apt install -y nodejs npm ffmpeg python3 python3-pip git
sudo pip3 install yt-dlp --break-system-packages

# Install Process Manager PM2 secara global
sudo npm install -g pm2
```

### 2. Clone & Setup Project di VPS:
```bash
# Clone proyek & install dependensi
git clone https://github.com/lannreal/turuajakaliyak.git
cd turuajakaliyak
npm install

# Jalankan server API di latar belakang 24/7 menggunakan PM2
pm2 start index.js --name "ytm-api" -- server 3000

# Pengaturan auto-start saat VPS di-reboot
pm2 startup
pm2 save
```

### 3. Konfigurasi Nginx Reverse Proxy & SSL (Domain Kustom):

Buka konfigurasi Nginx baru:
```bash
sudo nano /etc/nginx/sites-available/ytm-api
```

Tempelkan konfigurasi berikut (*ganti `api.domain-anda.com` dengan domain Anda*):
```nginx
server {
    listen 80;
    server_name api.domain-anda.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Aktifkan konfigurasi & dapatkan **Sertifikat SSL Gratis (HTTPS)**:
```bash
sudo ln -s /etc/nginx/sites-available/ytm-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Pasang SSL Gratis via Certbot
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.domain-anda.com
```

---

### ☁️ 4. Deploy di Cloud PaaS (Render / Railway / Koyeb):
- **Build Command**: `npm install`
- **Start Command**: `node index.js server 3000`
- **Environment Variable**: `PORT=3000`

</details>

---

## 📡 REST API Documentation

Jalankan server REST API dengan `node index.js server 3000`, lalu tembak endpoint berikut dari Browser, Postman, atau Frontend App Anda:

```http
GET http://localhost:3000/
```

### 📋 Daftar Endpoints

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

## 📄 Contoh Respon JSON Seluruh Endpoints

<details>
<summary>🔍 <b>1. GET /api/search?q=Sheila+on+7&page=1 (Hasil Pencarian)</b></summary>

<br />

```json
{
  "status": "success",
  "command": "search",
  "query": "Sheila on 7",
  "page": 1,
  "totalPages": 2,
  "totalResults": 21,
  "data": [
    {
      "type": "song",
      "id": "k1BfsO0mxWQ",
      "title": "Dan...",
      "artist": "Sheila On 7",
      "duration": "4:49",
      "coverArt": "https://yt3.googleusercontent.com/h52YQ8oAiGCiZFp5W1RGaj8GQMde1hNmYV7_ad3XgWcygvz7riguymmuvMj2yUoP1qhU2C3zoDJu72w=w120-h120-l90-rj",
      "webUrl": "https://music.youtube.com/watch?v=k1BfsO0mxWQ",
      "streamUrl": "http://localhost:3000/stream/k1BfsO0mxWQ"
    },
    {
      "type": "album",
      "id": "MPREb_Z5bsZC1RS6i",
      "title": "Sheila On 7 Top Request",
      "artist": "Sheila On 7",
      "coverArt": "https://yt3.googleusercontent.com/8QpSnAk_R6sdSrMLgjzuEY2DD2e9V9SfiZ5erdHAqSnFA9bTIfXgz5PsWZldZ0CJbZQi9mpSI-ujt02e=w544-h544-l90-rj",
      "webUrl": "https://music.youtube.com/browse/MPREb_Z5bsZC1RS6i"
    },
    {
      "type": "artist",
      "id": "UC1XMM7X-iGTqe5oN8R6lgoA",
      "title": "Sheila on 7",
      "coverArt": "https://yt3.googleusercontent.com/5LC4xqfoLIzzaXIPoE00zXG4B2_JjTI2j_57E-KMcAvFhAE2QspYRBtIRFRsMRA11Vs55b1jQ7k67eh3=w120-h120-l90-rj",
      "webUrl": "https://music.youtube.com/channel/UC1XMM7X-iGTqe5oN8R6lgoA"
    }
  ]
}
```

</details>

<details>
<summary>🔍 <b>2. GET /api/song/k1BfsO0mxWQ (Detail Lagu, Specs, Lirik Ganda, & Related)</b></summary>

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
    "coverArt": "https://yt3.googleusercontent.com/h52YQ8oAiGCiZFp5W1RGaj8GQMde1hNmYV7_ad3XgWcygvz7riguymmuvMj2yUoP1qhU2C3zoDJu72w=w544-h544-l90-rj",
    "webUrl": "https://music.youtube.com/watch?v=k1BfsO0mxWQ",
    "streamUrl": "http://localhost:3000/stream/k1BfsO0mxWQ",
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
          "Seperti sedia kala dimana kau bisa bercanda",
          "Maafkan aku"
        ]
      },
      "synced": [
        {
          "time": "00:19.04",
          "seconds": 19.04,
          "text": "Dan bila esok datang kembali"
        },
        {
          "time": "00:26.79",
          "seconds": 26.79,
          "text": "Seperti sedia kala"
        }
      ]
    },
    "relatedSongs": [
      {
        "type": "song",
        "id": "hv00T3jdIhc",
        "title": "Kita",
        "artist": "Sheila On 7",
        "coverArt": "https://yt3.googleusercontent.com/YXzLBS3PLlIQy70cJtRZLjEQpdB-un0l72PfFg_HFftVaWGTsxDr5iTwCWayyHF_3R8GGLoi4ZadJiVOMg=w120-h120-l90-rj",
        "webUrl": "https://music.youtube.com/watch?v=hv00T3jdIhc",
        "streamUrl": "http://localhost:3000/stream/hv00T3jdIhc"
      }
    ]
  }
}
```

</details>

<details>
<summary>🔍 <b>3. GET /api/artist/UCoy8sTKrImqfSq6TYOSW81A (Profil Artis & Top Songs)</b></summary>

<br />

```json
{
  "status": "success",
  "command": "artist",
  "type": "artist",
  "data": {
    "id": "UCoy8sTKrImqfSq6TYOSW81A",
    "name": "Sheila On 7",
    "webUrl": "https://music.youtube.com/channel/UCoy8sTKrImqfSq6TYOSW81A",
    "coverArt": "https://yt3.googleusercontent.com/5LC4xqfoLIzzaXIPoE00zXG4B2_JjTI2j_57E-KMcAvFhAE2QspYRBtIRFRsMRA11Vs55b1jQ7k67eh3=w544-h544-l90-rj",
    "topSongs": [
      {
        "id": "k1BfsO0mxWQ",
        "title": "Dan...",
        "artist": "Sheila On 7",
        "album": "Sheila On 7",
        "duration": "4:49",
        "coverArt": "https://yt3.googleusercontent.com/h52YQ8oAiGCiZFp5W1RGaj8GQMde1hNmYV7_ad3XgWcygvz7riguymmuvMj2yUoP1qhU2C3zoDJu72w=w120-h120-l90-rj",
        "webUrl": "https://music.youtube.com/watch?v=k1BfsO0mxWQ",
        "streamUrl": "http://localhost:3000/stream/k1BfsO0mxWQ"
      }
    ],
    "albums": [
      {
        "id": "MPREb_N8YZSqmQiv4",
        "title": "07 Des",
        "year": "2002",
        "coverArt": "https://yt3.googleusercontent.com/lPal6Q1Ddjr0g5xDu_6UXiutKEjwK3vcbOLa-UmhI85SsJhtNnqD3gwygs2EGsESjJbSjor8-6Mqy4iWXw=w544-h544-l90-rj",
        "webUrl": "https://music.youtube.com/browse/MPREb_N8YZSqmQiv4"
      }
    ]
  }
}
```

</details>

<details>
<summary>🔍 <b>4. GET /api/album/MPREb_N8YZSqmQiv4 (Detail Album & Tracklist)</b></summary>

<br />

```json
{
  "status": "success",
  "command": "album",
  "type": "album",
  "data": {
    "id": "MPREb_N8YZSqmQiv4",
    "title": "07 Des",
    "artist": "Sheila On 7",
    "year": "2002",
    "totalTracks": 10,
    "coverArt": "https://yt3.googleusercontent.com/lPal6Q1Ddjr0g5xDu_6UXiutKEjwK3vcbOLa-UmhI85SsJhtNnqD3gwygs2EGsESjJbSjor8-6Mqy4iWXw=w544-h544-l90-rj",
    "webUrl": "https://music.youtube.com/browse/MPREb_N8YZSqmQiv4",
    "tracks": [
      {
        "trackNumber": 1,
        "id": "xKU58YkAcLw",
        "title": "Hingga Ujung Waktu",
        "artist": "Sheila On 7",
        "duration": "4:27",
        "webUrl": "https://music.youtube.com/watch?v=xKU58YkAcLw",
        "streamUrl": "http://localhost:3000/stream/xKU58YkAcLw"
      },
      {
        "trackNumber": 2,
        "id": "nSPj50gQ_m4",
        "title": "Seberapa Pantas",
        "artist": "Sheila On 7",
        "duration": "4:02",
        "webUrl": "https://music.youtube.com/watch?v=nSPj50gQ_m4",
        "streamUrl": "http://localhost:3000/stream/nSPj50gQ_m4"
      }
    ]
  }
}
```

</details>

<details>
<summary>🔍 <b>5. GET /api/playlist/PL3LUUT1_qZN5G6hOlPm64aCe6A3yIwZKh (Detail Playlist & Tracklist)</b></summary>

<br />

```json
{
  "status": "success",
  "command": "playlist",
  "type": "playlist",
  "data": {
    "id": "PL3LUUT1_qZN5G6hOlPm64aCe6A3yIwZKh",
    "title": "kumpulan lagu-lagu Sheila On 7",
    "author": "Dhimas Prathama",
    "totalTracks": 30,
    "coverArt": "https://yt3.ggpht.com/LZDNF3lvtJojy-s7DxUJAxIsc60AINg-ExCCe0SLgnyhBsMuIDQLVIBl3xic0a__n8kYrdLHVw=s1200",
    "webUrl": "https://music.youtube.com/playlist?list=PL3LUUT1_qZN5G6hOlPm64aCe6A3yIwZKh",
    "tracks": [
      {
        "trackNumber": 1,
        "id": "k1BfsO0mxWQ",
        "title": "Dan...",
        "artist": "Sheila On 7",
        "duration": "4:49",
        "coverArt": "https://yt3.googleusercontent.com/h52YQ8oAiGCiZFp5W1RGaj8GQMde1hNmYV7_ad3XgWcygvz7riguymmuvMj2yUoP1qhU2C3zoDJu72w=w120-h120-l90-rj",
        "webUrl": "https://music.youtube.com/watch?v=k1BfsO0mxWQ",
        "streamUrl": "http://localhost:3000/stream/k1BfsO0mxWQ"
      }
    ]
  }
}
```

</details>

<details>
<summary>🔍 <b>6. GET /api/home?page=1 (Rekomendasi Beranda)</b></summary>

<br />

```json
{
  "status": "success",
  "command": "search",
  "mode": "home",
  "page": 1,
  "totalPages": 4,
  "totalSections": 12,
  "data": [
    {
      "sectionTitle": "Rekomendasi Musik",
      "items": [
        {
          "type": "song",
          "id": "k1BfsO0mxWQ",
          "title": "Dan...",
          "artist": "Sheila On 7",
          "duration": "4:49",
          "coverArt": "https://yt3.googleusercontent.com/...",
          "webUrl": "https://music.youtube.com/watch?v=k1BfsO0mxWQ",
          "streamUrl": "http://localhost:3000/stream/k1BfsO0mxWQ"
        }
      ]
    }
  ]
}
```

</details>

<details>
<summary>🔍 <b>7. GET /api/trending?page=1 (Top Charts Trending)</b></summary>

<br />

```json
{
  "status": "success",
  "command": "trending",
  "page": 1,
  "totalPages": 1,
  "totalResults": 20,
  "data": [
    {
      "type": "song",
      "id": "0S0gYCRWeSI",
      "title": "BEST OF SHEILA ON 7",
      "artist": "SETH.",
      "coverArt": "https://i.ytimg.com/vi/0S0gYCRWeSI/hqdefault.jpg",
      "webUrl": "https://music.youtube.com/watch?v=0S0gYCRWeSI",
      "streamUrl": "http://localhost:3000/stream/0S0gYCRWeSI"
    }
  ]
}
```

</details>

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

## 🌐 Data Sources & Credits

- 🎶 **Metadata, Search & Audio Stream**: [YouTube Music](https://music.youtube.com)
- 🎤 **Official Lyrics Provider**: LyricFind / Musixmatch (via YouTube Music)
- ⏱️ **Synced Timestamps Lyrics**: [LRCLIB](https://lrclib.net)

---

<div align="center">
  <img src="https://raw.githubusercontent.com/andrei-pavel/andrei-pavel/main/assets/welcomes.gif" width="100%" height="8px" alt="animated divider" />
  <br />
  <sub>Built with ❤️ & Node.js — Distributed under the <b>MIT License</b></sub>
</div>
