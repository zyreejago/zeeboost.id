interface TelegramMessage {
  chat_id: string | number;
  text: string;
  parse_mode?: 'HTML' | 'Markdown';
}

interface OrderInfo {
  transactionId: string;
  robloxUsername: string;
  robuxAmount: number;
  totalPrice: number;
  method: string;
  status: string;
  whatsappNumber?: string;
  createdAt: Date;
}

export async function sendTelegramNotification(orderInfo: OrderInfo) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_GROUP_CHAT_ID;
  
  if (!BOT_TOKEN || !CHAT_ID) {
    console.error('Telegram bot token or chat ID not configured');
    return false;
  }

  const message = formatOrderMessage(orderInfo);
  
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      } as TelegramMessage)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('Telegram notification sent successfully:', result);
      return true;
    } else {
      console.error('Failed to send Telegram notification:', result);
      return false;
    }
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    return false;
  }
}

function formatOrderMessage(orderInfo: OrderInfo): string {
  const {
    transactionId,
    robloxUsername,
    robuxAmount,
    totalPrice,
    method,
    status,
    whatsappNumber,
    createdAt
  } = orderInfo;

  const methodText = method === 'vialogin' ? '🔐 Via Login' : 
                    method === 'gamepass' ? '🎮 Gamepass' : 
                    method === 'group' ? '👥 Group' : method;

  const statusEmoji = status === 'pending' ? '⏳' : 
                     status === 'completed' ? '✅' : 
                     status === 'failed' ? '❌' : '📋';

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta'
    }).format(date);
  };

  return `🚨 <b>ORDERAN MASUK ZEEBOOST</b> 🚨\n\n` +
         `📋 <b>ID Transaksi:</b> ${transactionId}\n` +
         `👤 <b>Username Roblox:</b> ${robloxUsername}\n` +
         `💎 <b>Jumlah Robux:</b> ${robuxAmount.toLocaleString('id-ID')}\n` +
         `💰 <b>Total Harga:</b> ${formatRupiah(totalPrice)}\n` +
         `🔧 <b>Metode:</b> ${methodText}\n` +
         `${statusEmoji} <b>Status:</b> ${status.toUpperCase()}\n` +
         `📱 <b>WhatsApp:</b> ${whatsappNumber || 'Tidak tersedia'}\n` +
         `🕐 <b>Waktu:</b> ${formatDate(createdAt)}\n\n` +
         `#OrderMasuk #ZeeBoost #${method.toUpperCase()}`;
}