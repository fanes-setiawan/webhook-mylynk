# Webhook Lynk.id ke Discord

Sistem ini berfungsi sebagai "Middleware" yang menerima event Webhook dari Lynk.id, memformatnya menjadi Discord Embed yang rapi, lalu meneruskannya ke Discord Channel Anda. 
Karena payload Lynk.id dan Discord memiliki struktur yang berbeda, middleware ini diperlukan sebagai penerjemah (parser).

Sistem ini dibangun menggunakan **Next.js (App Router)** yang sangat ringan, cepat, dan mudah di-*deploy* ke Vercel secara gratis.

## Langkah Konfigurasi

### A. Membuat Discord Webhook
1. Buka aplikasi Discord.
2. Pergi ke Channel tempat Anda ingin menerima notifikasi.
3. Klik ikon gir (Edit Channel) -> **Integrations** -> **Webhooks**.
4. Klik **New Webhook**.
5. Beri nama webhook (misal: "Lynk Notifier") dan pilih channel.
6. Klik **Copy Webhook URL**. (Simpan URL ini, jangan bagikan ke publik).

### B. Konfigurasi Sistem
1. Pada *source code* ini, salin file `.env.example` menjadi `.env.local` (untuk pengembangan lokal) atau atur Environment Variable di Vercel jika langsung deploy.
2. Isi `DISCORD_WEBHOOK_URL` dengan URL yang baru saja Anda copy.
   ```
   DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
   ```

### C. Menjalankan Backend secara Lokal
Untuk mengetesnya di komputer lokal sebelum upload ke Vercel:
1. Pastikan Anda sudah menginstal Node.js.
2. Jalankan perintah:
   ```bash
   npm install
   npm run dev
   ```
3. Server lokal akan berjalan di `http://localhost:3000`.

*Catatan: Agar Lynk.id bisa mengakses localhost Anda saat testing, Anda bisa menggunakan layanan seperti **Ngrok** (`ngrok http 3000`).*

### D. Mengisi URL Webhook di Lynk.id
Setelah sistem Anda di-deploy (misalnya di Vercel dengan domain `https://lynk-discord.vercel.app`):
1. Masuk ke dashboard Lynk.id Anda.
2. Cari menu pengaturan Webhook URL.
3. Masukkan URL endpoint sistem Anda. **PENTING: Gunakan endpoint debug dulu!**
   - URL Debug: `https://domain-anda.com/api/webhook/lynk/debug`

### E. Mengetahui Payload Asli Lynk.id (Sangat Penting!)
Format JSON yang dikirim Lynk.id belum diketahui strukturnya secara pasti. Kita harus mengetahuinya agar bisa mengambil data (Order ID, Total, dll) dengan benar.

1. Setelah URL Debug dimasukkan, klik tombol **Test URL** di Lynk.id atau lakukan satu transaksi test.
2. Buka dashboard Log Vercel Anda (atau terminal lokal jika menggunakan Ngrok).
3. Anda akan melihat log berjudul `--- LYNK.ID WEBHOOK DEBUG ---`.
4. Copy bagian `Parsed Body`. Itu adalah bentuk payload asli dari Lynk.id.

### F. Menyesuaikan Parser
Setelah Anda melihat data aslinya:
1. Buka file `src/app/api/webhook/lynk/route.ts`.
2. Lihat bagian kode: `// Ambil data transaksi`.
3. Ubah nama variabel seperti `payload.order_id` atau `payload.total` agar sesuai dengan struktur JSON asli dari log debug tadi.
4. Simpan dan deploy ulang sistem.

### G. Mengaktifkan Webhook Utama
1. Kembali ke pengaturan Webhook Lynk.id.
2. Ubah URL menjadi endpoint utama:
   `https://domain-anda.com/api/webhook/lynk`
3. Lakukan **Test URL** kembali.

### H. Memastikan Transaksi Masuk ke Discord
Jika konfigurasi parser sudah benar, Anda akan langsung melihat pesan di channel Discord dengan format "💰 Transaksi Baru Lynk.id" menggunakan tampilan Embed yang profesional.

## Keamanan
- Sistem ini tidak mengekspos Webhook Discord Anda ke luar.
- Anda bisa menambahkan validasi `Merchant Key` di kode `route.ts` jika Lynk.id mengirimkan signature khusus di bagian Header.
