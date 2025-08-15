import { NextRequest, NextResponse } from "next/server";

// Gunakan environment variable untuk keamanan
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

export async function POST(req: NextRequest) {
  try {
    // Validasi API key
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY not found in environment variables");
      return NextResponse.json(
        { text: "Maaf, layanan chat sedang tidak tersedia. Silakan hubungi support melalui WhatsApp." },
        { status: 500 }
      );
    }

    const { message } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { text: "Pesan tidak valid. Silakan kirim pesan yang benar." },
        { status: 400 }
      );
    }

    // Data website ZeeBoost
    const websiteInfo = `
Tentang ZeeBoost:
- Platform topup Robux terpercaya #1 di Indonesia sejak 2020
- Telah melayani 100.000+ gamer dengan rating 4.9/5
- Proses instan 2-5 menit, sistem otomatis 24/7
- Keamanan terjamin dengan enkripsi SSL

Layanan ZeeBoost:
- Topup Robux untuk game Roblox
- Berbagai paket Robux mulai dari 80 Robux hingga 10.000+ Robux
- Harga kompetitif dan transparan
- Customer service AI 24/7

Cara Topup:
1. Pilih paket Robux yang diinginkan
2. Masukkan username Roblox Anda
3. Pilih metode pembayaran (DANA, OVO, GoPay, Bank Transfer, Indomaret)
4. Selesaikan pembayaran
5. Robux akan masuk ke akun dalam 2-5 menit

Metode Pembayaran:
- E-wallet: DANA, OVO, GoPay
- Bank Transfer: BCA, BNI, BRI, Mandiri
- Retail: Indomaret, Alfamart

Tentang Roblox:
- Platform game online populer dengan jutaan game
- Robux adalah mata uang virtual untuk membeli item, gamepass, dan akses premium
- Dapat digunakan untuk customize avatar, beli akses game premium, dan trading

Keunggulan ZeeBoost:
- Proses tercepat di Indonesia (2-5 menit)
- Harga terjangkau dan transparan
- Keamanan terjamin 100%
- Support 24/7
- Sistem otomatis tanpa delay

Kontak: support@zeeboost.com | WhatsApp: +6287740517441
`;

    // Prompt instruksi
    const prompt = `
Kamu adalah AI Customer Service ZeeBoost yang ramah dan profesional. Jawab pertanyaan user hanya seputar:
1. Layanan ZeeBoost (topup Robux, cara pembayaran, proses pengiriman)
2. Roblox (game, akun, username, cara bermain)
3. Robux (mata uang virtual Roblox, penggunaan, manfaat)

Gunakan informasi berikut sebagai referensi:
${websiteInfo}

Jika user bertanya tentang topik di luar ketiga hal tersebut (politik, olahraga, teknologi umum, dll), jawab: "Maaf, saya hanya dapat membantu pertanyaan seputar layanan ZeeBoost, Roblox, dan Robux. Apakah ada yang bisa saya bantu terkait hal tersebut?"

Berikan jawaban yang:
- Ramah dan profesional
- Singkat tapi informatif
- Dalam bahasa Indonesia
- Sesuai dengan data di atas
- Selalu tawarkan bantuan lebih lanjut
- Jangan pernah menyebut "Gemini" dalam respons

Pertanyaan user: ${message}
`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error: ${response.status} - ${errorText}`);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Validasi response dari Gemini
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error("Invalid response structure from Gemini API:", data);
      throw new Error("Invalid response from AI service");
    }

    const aiResponse = data.candidates[0].content.parts[0].text || 
      "Maaf, saya tidak dapat memproses pertanyaan Anda saat ini. Silakan coba lagi.";

    // Return format yang sesuai dengan ChatWidget (menggunakan 'text' bukan 'response')
    return NextResponse.json({ text: aiResponse });
  } catch (_error) {
    console.error("AI Error:", error);
    return NextResponse.json(
      { 
        text: "Maaf, terjadi kesalahan sistem. Tim support kami akan segera membantu Anda. Silakan hubungi WhatsApp: +6287740517441 untuk bantuan langsung." 
      },
      { status: 500 }
    );
  }
}