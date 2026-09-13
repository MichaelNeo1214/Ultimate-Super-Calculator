# 🚀 Ultimate Super Calculator

![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![Open Source](https://img.shields.io/badge/Open%20Source-Yes-brightgreen.svg?style=for-the-badge)

**Ultimate Super Calculator** adalah aplikasi kalkulator berbasis web (Single Page Application) yang sangat komprehensif, cepat, dan ringan. Dibangun dari nol tanpa *framework* berat, aplikasi ini merangkum ratusan rumus spesifik dari berbagai bidang kehidupan—mulai dari matematika dasar, infrastruktur IT, *gaming*, hingga modifikasi otomotif.

Dibuat dan dikembangkan oleh **Michael Assencio Pratama**.

---

## 📋 Daftar Isi
1. [Tentang Proyek](#-tentang-proyek)
2. [Fitur & Modul Utama](#-fitur--modul-utama)
3. [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
4. [Instalasi & Cara Penggunaan](#-instalasi--cara-penggunaan)
5. [Struktur Direktori](#-struktur-direktori)
6. [Panduan Kontribusi](#-panduan-kontribusi)
7. [Lisensi](#-lisensi)

---

## 💡 Tentang Proyek
Proyek ini dibuat sebagai bentuk solusi *all-in-one* bagi para pelajar, mahasiswa, *engineer*, *gamer*, hingga penggiat kripto yang sering kali harus membuka banyak situs berbeda hanya untuk menghitung rumus yang spesifik (seperti kalkulator *Subnetting*, VRAM AI, atau *Pity Rate Gacha*).

Aplikasi ini sepenuhnya **Offline-Ready** (jika diunduh) dan sangat mengedepankan UI/UX yang minimalis serta responsif.

---

## 🌟 Fitur & Modul Utama
Aplikasi ini dibagi menjadi 11 kategori modul kalkulasi:

1. 🧮 **Dasar & Saintifik**: Operasi aritmatika dasar, Modulo, Pangkat, Akar, Trigonometri (Sin, Cos, Tan), Logaritma, dan Faktorial.
2. 📐 **Geometri**: Luas dan Volume (Persegi, Segitiga, Lingkaran, Kubus, Bola, Tabung, dll).
3. 🍎 **Fisika**: Kecepatan, Gaya (Hukum Newton), dan Massa Jenis (Densitas).
4. 💰 **Keuangan & Kripto**: Bunga Tunggal/Majemuk, ROI, Kalkulator DCA (*Average Price*), dan Profitabilitas *Mining* Kripto.
5. 🩺 **Kesehatan**: Kalkulator BMI (*Body Mass Index*).
6. 🖥️ **IT & Server**: Kalkulator *Subnetting* IP, Estimasi Waktu Unduh, Penggunaan Bandwidth Server, dan Estimasi RAM Server Minecraft.
7. 🤖 **AI Local Inference**: Estimasi kebutuhan VRAM LLM & Ukuran Model GGUF berdasarkan parameter dan bit kuantisasi.
8. 🏗️ **Konstruksi Sipil & Air**: Debit Air (Hukum Kontinuitas) dan Tekanan Hidrostatis.
9. 🏍️ **Otomotif**: Kalkulator CC Mesin (*Bore x Stroke*), Rasio Gir Final (Sprocket), dan Rasio Campuran Oli Samping 2-Tak.
10. 🎮 **Gaming**: Konverter Sensitivitas (eDPI), Kalkulator Probabilitas *Gacha/Pity*, dan Efisiensi Harga *Top-Up*.
11. 🎓 **Akademik & Personal**: Kalkulator IPK/GPA, Prediksi Skor TOEFL PBT, dan Agregator Biaya Subskripsi.

---

## 🛠️ Teknologi yang Digunakan
Proyek ini sengaja dirancang seringan mungkin tanpa *dependencies* Node.js (NPM).
- **HTML5**: Struktur kerangka aplikasi.
- **Tailwind CSS (CDN)**: *Styling* utilitas yang modern, rapi, responsif, dan ringan.
- **Vanilla JavaScript (ES6)**: Logika dan kalkulasi modular tanpa *framework* seperti React atau Vue agar lebih cepat diakses di perangkat spesifikasi rendah.

---

## 🚀 Instalasi & Cara Penggunaan

Karena aplikasi ini menggunakan Vanilla JS dan CDN, Anda **tidak perlu** menginstal server lokal atau *package manager*. 

### Opsi 1: Menjalankan Secara Lokal (Offline)
1. *Clone repository* ini ke komputer Anda:
   ```bash
   git clone https://github.com/USERNAME_ANDA/ultimate-super-calculator.git
   ```
2. Buka folder proyek tersebut:
   ```bash
   cd ultimate-super-calculator
   ```
3. Klik dua kali pada file `index.html` untuk membukanya langsung di *browser* (Chrome, Firefox, Safari, Edge, dll).
4. Aplikasi siap digunakan!

### Opsi 2: Menggunakan Versi Live (Online)
Jika Anda sudah men-*deploy* proyek ini (misal menggunakan GitHub Pages, Vercel, atau Netlify), pengguna dapat langsung mengaksesnya melalui tautan berikut:
👉 **[Live Demo: Ultimate Super Calculator](https://www.michaelap.my.id/Calculator%20Online/index.html)**

---

## 📁 Struktur Direktori
```text
ultimate-super-calculator/
│
├── index.html          # Halaman utama aplikasi (UI)
├── README.md           # Dokumentasi proyek
└── js/                 # Folder JavaScript
    ├── main.js         # File logika utama & interaksi UI
    └── modules/        # Kumpulan file rumus yang terpisah
        ├── math.js
        ├── physics.js
        ├── crypto.js
        ├── gaming.js
        └── ...
```

---

## 🤝 Panduan Kontribusi
Kalkulator ini sangat terbuka untuk penambahan rumus-rumus baru! Jika Anda memiliki formula *niche* atau perbaikan *bug*, silakan ikuti langkah berikut:

1. **Fork** *repository* ini.
2. Buat *branch* fitur Anda (`git checkout -b fitur/TambahRumusX`).
3. Tambahkan fungsi baru Anda di dalam folder `js/modules/` yang sesuai.
4. Jangan lupa panggil fungsi tersebut dan tambahkan antarmuka (UI) di `index.html`.
5. *Commit* perubahan Anda (`git commit -m 'Menambahkan rumus X'`).
6. *Push* ke *branch* (`git push origin fitur/TambahRumusX`).
7. Buka **Pull Request**.

---

## 📜 Lisensi
Didistribusikan di bawah **MIT License**. Lihat file `LICENSE` untuk informasi lebih lanjut. Intinya, Anda bebas menggunakan, menyalin, memodifikasi, dan mendistribusikan proyek ini, asalkan tetap mencantumkan kredit pembuat asli.

---
*Dibuat dengan ❤️ oleh Michael Assencio Pratama untuk komunitas.*
