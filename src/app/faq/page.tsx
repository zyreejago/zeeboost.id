'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "Metode top up apa saja yang tersedia?",
    answer: "Kami menyediakan dua metode:\n\n• **Gamepass** → Robux akan masuk minimal 5 hari sesuai antrian.\n\n• **Via Login (Vilog)** → Robux masuk 10–30 menit sesuai antrian."
  },
  {
    question: "Apa itu metode Gamepass?",
    answer: "Metode Gamepass adalah pembelian Robux melalui item game yang kamu buat sendiri di Roblox. Kami membeli item tersebut, dan Robux akan masuk ke akunmu sesuai ketentuan Roblox (minimal 5 hari)."
  },
  {
    question: "Apa itu metode Vilog?",
    answer: "Metode Vilog adalah pengisian Robux dengan login ke akun Roblox kamu. Prosesnya lebih cepat (10–30 menit) dibanding Gamepass, namun hanya tersedia pada jam tertentu."
  },
  {
    question: "Jam operasional untuk metode Vilog?",
    answer: "Vilog bisa diproses setiap hari pukul **07.00 – 00.00 WIB**."
  },
  {
    question: "Bagaimana cara tahu kalau sedang ada diskon?",
    answer: "Ikuti Instagram kami **@zeeboost.com** untuk informasi promo, giveaway, dan diskon terbaru."
  },
  {
    question: "Data apa saja yang dibutuhkan untuk Vilog?",
    answer: "• Username Roblox\n• Password Roblox\n\n💡 **Keamanan 1000% terjamin** — data hanya digunakan untuk proses top up."
  },
  {
    question: "Apakah aman memberikan password Roblox?",
    answer: "**Aman 1000%!** Kami tidak menyimpan data login setelah proses selesai dan tidak akan mengubah apapun di akunmu selain menambahkan Robux."
  },
  {
    question: "Berapa minimal dan maksimal pembelian Robux?",
    answer: "Minimal pembelian adalah **50 Robux**. Maksimal pembelian tergantung stok yang tersedia."
  },
  {
    question: "Apakah ada biaya tambahan selain harga Robux?",
    answer: "Harga sudah termasuk biaya layanan. **Tidak ada biaya tambahan tersembunyi**."
  },
  {
    question: "Bagaimana jika Robux belum masuk setelah waktu yang dijanjikan?",
    answer: "Segera hubungi admin melalui **WhatsApp atau Instagram** dengan bukti transaksi. Kami akan membantu memeriksa status order kamu."
  },
  {
    question: "Apakah Robux yang saya beli resmi?",
    answer: "Ya, Robux yang kami kirim adalah **resmi dan berasal dari sumber legal**."
  },
  {
    question: "Bisakah top up dilakukan di luar jam operasional?",
    answer: "Untuk metode **Gamepass bisa dilakukan kapan saja**. Untuk Vilog, order di luar jam operasional akan diproses mulai jam 07.00 WIB keesokan harinya."
  },
  {
    question: "Bagaimana jika saya lupa password Roblox untuk metode Vilog?",
    answer: "Kamu harus memastikan password benar sebelum order. Jika salah, proses akan tertunda."
  },
  {
    question: "Apakah bisa refund?",
    answer: "Refund bisa dilakukan jika order belum diproses sama sekali atau stok habis. Dana akan dikembalikan sesuai nominal yang dibayar."
  },
  {
    question: "Apakah ada promo khusus pelanggan setia?",
    answer: "Ya! Pelanggan setia akan mendapat potongan harga dan prioritas antrian. Info lengkap di Instagram **@zeeboost.com**."
  }
];

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const formatAnswer = (answer: string) => {
    return answer.split('\n').map((line, index) => {
      if (line.trim() === '') return <br key={index} />;
      
      // Handle bold text
      const parts = line.split(/\*\*(.*?)\*\*/);
      return (
        <span key={index}>
          {parts.map((part, partIndex) => 
            partIndex % 2 === 1 ? (
              <strong key={partIndex} className="font-semibold text-primary">
                {part}
              </strong>
            ) : (
              part
            )
          )}
          <br />
        </span>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 sm:w-32 sm:h-32 bg-gradient-to-br from-primary/20 to-primary-light/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-primary-300/30 to-primary/30 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-40 left-1/4 w-24 h-24 sm:w-40 sm:h-40 bg-gradient-to-br from-primary-light/20 to-primary-300/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 right-1/3 w-20 h-20 sm:w-28 sm:h-28 bg-gradient-to-br from-primary/25 to-primary-dark/25 rounded-full blur-2xl animate-pulse" style={{animationDelay: '0.5s'}}></div>
      </div>
      
      <Navbar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 mt-16 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="relative inline-block mb-4 sm:mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-light rounded-full blur-lg opacity-30 animate-pulse"></div>
            <div className="relative inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary to-primary-dark rounded-full shadow-lg">
              <span className="text-2xl sm:text-3xl animate-bounce">❓</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-800 via-primary to-primary-dark bg-clip-text text-transparent mb-4 sm:mb-6 px-4">
            FAQ – Top Up Robux Roblox di ZeeBoost
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
            Temukan jawaban untuk pertanyaan yang sering ditanyakan seputar layanan top up Robux kami
          </p>
          <div className="mt-6 sm:mt-8 flex justify-center">
            <div className="h-1 w-20 sm:w-24 bg-gradient-to-r from-primary to-primary-light rounded-full"></div>
          </div>
        </div>

        {/* FAQ Items */}
        <div className="max-w-5xl mx-auto">
          <div className="space-y-4 sm:space-y-6">
            {faqData.map((item, index) => (
              <div 
                key={index}
                className="group bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-purple-100 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-[1.01] sm:hover:scale-[1.02] hover:border-primary/30"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 text-left flex items-center justify-between hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary-light/5 transition-all duration-300"
                >
                  <div className="flex items-center space-x-3 sm:space-x-6 flex-1 min-w-0">
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-dark rounded-full blur-sm opacity-30 group-hover:opacity-50 transition-opacity"></div>
                      <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-sm sm:text-lg">
                          {index + 1}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 group-hover:text-primary transition-colors duration-300 pr-2 sm:pr-4">
                      {item.question}
                    </h3>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary/10 to-primary-light/10 flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary-light/20 transition-all duration-300">
                      <svg
                        className={`w-5 h-5 sm:w-6 sm:h-6 text-primary transition-all duration-300 ${
                          openItems.includes(index) ? 'rotate-180 scale-110' : 'group-hover:scale-110'
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </button>
                
                {openItems.includes(index) && (
                  <div className="px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 animate-in slide-in-from-top-2 duration-300">
                    <div className="pl-10 sm:pl-16 lg:pl-18 pr-2 sm:pr-4">
                      <div className="p-4 sm:p-6 bg-gradient-to-br from-primary/5 to-primary-light/5 rounded-xl border-l-4 border-primary">
                        <div className="text-gray-700 leading-relaxed text-base sm:text-lg">
                          {formatAnswer(item.answer)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="max-w-5xl mx-auto mt-16 sm:mt-20">
          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary-light to-primary-dark opacity-90"></div>
            <div className="relative p-6 sm:p-8 lg:p-10 text-white text-center">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full mb-4">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                  Masih Ada Pertanyaan?
                </h2>
                <p className="text-purple-100 mb-6 sm:mb-8 text-base sm:text-lg max-w-2xl mx-auto px-4">
                  Tim customer service kami siap membantu Anda 24/7 dengan respon cepat dan solusi terbaik
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4">
                <a
                  href="https://wa.me/6287740517441"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-green-500 hover:bg-green-600 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  WhatsApp
                </a>
                <a
                  href="https://instagram.com/zeeboost.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-pink-500 hover:bg-pink-600 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  Instagram
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}