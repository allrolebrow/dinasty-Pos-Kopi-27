# 📖 Panduan Setup Dynasty POS Kopi 27

## Cara Deploy ke GitHub Pages (GRATIS)

### Langkah 1 - Upload ke GitHub

1. Buka https://github.com dan login / daftar akun baru
2. Klik tombol **"+"** > **New repository**
3. Isi nama repo: `dynasty-pos` (atau nama apa saja)
4. Centang **"Add a README file"**
5. Klik **Create repository**
6. Upload semua file POS ini (index.html, style.css, app.js, logo.png)
   - Klik **Add file** > **Upload files**
   - Drag & drop semua file
   - Klik **Commit changes**

### Langkah 2 - Aktifkan GitHub Pages

1. Di halaman repo, klik **Settings**
2. Di sidebar kiri, klik **Pages**
3. Di bagian **Source**, pilih **Branch: main**
4. Klik **Save**
5. Tunggu 1-2 menit, lalu website kamu aktif di:
   `https://username-github-kamu.github.io/dynasty-pos/`

---

## Cara Hubungkan ke Google Sheets (Otomatis)

### Langkah 1 - Buat Google Spreadsheet

1. Buka https://sheets.google.com
2. Buat spreadsheet baru, beri nama **"Dynasty POS Data"**
3. Copy **Spreadsheet ID** dari URL:
   - URL contoh: `https://docs.google.com/spreadsheets/d/`**`1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms`**`/edit`
   - Bagian yang ditebalkan itulah ID-nya

### Langkah 2 - Buat Google Apps Script

1. Buka https://script.google.com
2. Klik **New project**
3. Hapus semua kode yang ada
4. Copy-paste seluruh isi file `google-apps-script.js`
5. Ganti baris ini dengan ID spreadsheet kamu:
   ```javascript
   const SPREADSHEET_ID = 'ISI_ID_SPREADSHEET_KAMU_DISINI';
   ```
6. Klik **Save** (Ctrl+S), beri nama project **"Dynasty POS"**

### Langkah 3 - Setup Spreadsheet (1x saja)

1. Di Apps Script, pilih fungsi **setupSpreadsheet** dari dropdown
2. Klik **Run** (▶)
3. Izinkan akses ketika diminta (klik Allow)

### Langkah 4 - Deploy sebagai Web App

1. Klik **Deploy** > **New deployment**
2. Klik ⚙️ lalu pilih **Web app**
3. Isi pengaturan:
   - **Description**: Dynasty POS API
   - **Execute as**: Me (email kamu)
   - **Who has access**: **Anyone** ⚠️ (PENTING! Harus Anyone)
4. Klik **Deploy**
5. Copy URL yang muncul (bentuknya seperti):
   `https://script.google.com/macros/s/AKfycb.../exec`

### Langkah 5 - Hubungkan ke Kasir

1. Buka website kasir kamu di GitHub Pages
2. Masukkan URL tadi ke kolom **"Google Apps Script URL"**
3. Isi nama kasir
4. Klik **Mulai Kasir** ✅

---

## Fitur yang Tersedia

| Fitur | Keterangan |
|-------|-----------|
| 📋 Kasir POS | Input pesanan, hitung total, kasir |
| 🖨️ Print Struk | Cetak struk langsung dari browser |
| ☁️ Google Sheets | Semua transaksi masuk otomatis |
| 📊 Dashboard | Lihat omset, profit, menu terlaris |
| 📦 Kelola Stok | Set stok & harga setiap menu |
| 💰 HPP/Modal | Tracking keuntungan tiap item |
| 💳 Multi-payment | Cash, QRIS, Transfer |
| 🎫 Diskon | Bisa input diskon % |
| 📝 Catatan | Tambah catatan di setiap order |

## Data di Google Sheets

Sheet **Transaksi**: Semua transaksi detail
- ID, Tanggal, Jam, Kasir
- Item dibeli, Jumlah item
- Subtotal, Diskon, Total
- HPP/Modal, Keuntungan
- Metode Bayar, Catatan

Sheet **Rekap Harian**: Per hari otomatis terupdate
- Total transaksi, Total item
- Total omset, Total modal, Total profit
- Margin keuntungan (%)

Sheet **Menu Terlaris**: Ranking menu
- Nama menu, Total terjual
- Total pendapatan, Total modal, Profit

---

## Tips Penggunaan

- **Stok ∞**: Kosongkan kolom stok = tidak ada batas
- **HPP/Modal**: Isi harga modal setiap menu agar profit akurat
- **Multi-kasir**: Bisa dipakai di HP/laptop berbeda sekaligus
- **Offline**: Tetap bisa pakai walau tidak ada internet, data sync saat online

## Troubleshooting

**Tidak bisa sync ke Sheets?**
- Pastikan URL Apps Script sudah benar
- Pastikan "Who has access" = Anyone
- Coba buka URL Apps Script langsung di browser, harus muncul `{"status":"Dynasty POS API Active ✅"}`

**Print tidak muncul?**
- Izinkan popup di browser
- Pastikan printer sudah terkoneksi

---

*Dynasty Pos Kopi 27 - Dari Ngopi Jadi Story* ☕
*WA: 0813 3003 0411*
