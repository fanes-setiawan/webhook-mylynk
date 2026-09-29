import { NextRequest, NextResponse } from 'next/server';

// Configuration
// Gunakan environment variable agar tidak hardcode
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const LYNK_MERCHANT_KEY = process.env.LYNK_MERCHANT_KEY;

export async function POST(req: NextRequest) {
  try {
    // 1. Verifikasi Environment Variable
    if (!DISCORD_WEBHOOK_URL) {
      console.error('CRITICAL: DISCORD_WEBHOOK_URL is not configured in environment variables.');
      return NextResponse.json({ success: false, message: 'Server configuration error' }, { status: 500 });
    }

    // 2. Baca payload dari Lynk.id
    const payload = await req.json();

    // Opsional: Jika Lynk.id memberikan signature di Header, Anda bisa memvalidasinya di sini
    // const signature = req.headers.get('x-lynk-signature');
    // if (signature !== LYNK_MERCHANT_KEY) { return error }

    // ==============================================================================================
    // PERHATIAN:
    // Field-field di bawah ini adalah ASUMSI karena format payload asli dari Lynk.id belum diketahui.
    // Silakan periksa hasil log dari endpoint /api/webhook/lynk/debug terlebih dahulu
    // lalu sesuaikan mapping variabel di bawah ini agar akurat!
    // ==============================================================================================
    
    // Tentukan jenis event (jika ada)
    const eventType = payload.event || payload.type || 'transaction';
    
    // Filter event jika perlu
    // if (eventType !== 'order.paid') {
    //   return NextResponse.json({ success: true, message: 'Event ignored' });
    // }

    // Ambil data transaksi (sesuaikan path ini nanti berdasarkan debug payload)
    const orderId = payload.order_id || payload.id || 'N/A';
    const productName = payload.product?.name || payload.product_name || 'Produk Lynk.id';
    const customerName = payload.customer?.name || payload.customer_name || 'Customer';
    const quantity = payload.quantity || payload.qty || 1;
    const totalAmount = payload.total || payload.amount || '0';
    const status = payload.status || payload.payment_status || 'N/A';
    
    // Format Waktu Jakarta
    const transactionDate = new Date().toLocaleString('id-ID', { 
      timeZone: 'Asia/Jakarta', 
      dateStyle: 'long', 
      timeStyle: 'short' 
    }) + ' WIB';

    // 3. Susun Payload Discord Embed
    const discordPayload = {
      embeds: [
        {
          title: "💰 Transaksi Baru Lynk.id",
          description: `Event: **${eventType}**`,
          color: 3066993, // Warna hijau
          fields: [
            {
              name: "Order ID",
              value: String(orderId),
              inline: true
            },
            {
              name: "Customer",
              value: String(customerName),
              inline: true
            },
            {
              name: "Status",
              value: String(status),
              inline: true
            },
            {
              name: "Produk",
              value: String(productName),
              inline: true
            },
            {
              name: "Quantity",
              value: String(quantity),
              inline: true
            },
            {
              name: "Total",
              value: String(totalAmount),
              inline: true
            },
            {
              name: "Waktu",
              value: String(transactionDate),
              inline: false
            }
          ],
          footer: {
            text: "Sistem Webhook Integrasi Lynk.id ke Discord"
          }
        }
      ]
    };

    // 4. Kirim ke Discord
    const discordResponse = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(discordPayload),
    });

    if (!discordResponse.ok) {
      const errorText = await discordResponse.text();
      console.error(`Discord API Error (${discordResponse.status}):`, errorText);
      return NextResponse.json(
        { success: false, message: 'Failed to forward message to Discord' }, 
        { status: 500 }
      );
    }

    // 5. Kembalikan respons 200 OK ke Lynk.id
    return NextResponse.json({ success: true, message: 'Webhook processed and sent to Discord successfully' }, { status: 200 });

  } catch (error) {
    console.error('Main Webhook Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
