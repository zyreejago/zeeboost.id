import Navbar from '@/components/Navbar';
import SimpleFooter from '@/components/SimpleFooter';
import ChatCS from '@/components/ChatCS';

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden flex items-center justify-center px-4">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-3xl"></div>
          <div className="absolute top-20 right-20 w-24 h-24 bg-gradient-to-br from-indigo-400 to-pink-500 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-1/3 w-28 h-28 bg-gradient-to-br from-pink-400 to-indigo-500 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-br from-blue-300 to-purple-400 rounded-full blur-3xl opacity-20"></div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}></div>
          <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
          <div className="absolute bottom-1/4 left-1/3 w-5 h-5 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '2s', animationDuration: '3.5s'}}></div>
          <div className="absolute bottom-1/3 right-1/3 w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.5s', animationDuration: '4.5s'}}></div>
        </div>
        
        <div className="max-w-2xl mx-auto text-center relative z-10">
          {/* 404 Icon */}
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-white to-gray-100 rounded-full flex items-center justify-center shadow-2xl border border-white/50 backdrop-blur-sm">
              <i className="fas fa-search text-gray-600 text-5xl"></i>
            </div>
          </div>
          
          {/* 404 Content */}
          <div className="mb-8">
            <h1 className="text-8xl sm:text-9xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4 drop-shadow-lg">
              404
            </h1>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4 drop-shadow-sm">
              Halaman Tidak Ditemukan
            </h2>
            <p className="text-lg text-gray-700 mb-6 bg-white/60 backdrop-blur-sm rounded-lg p-4 shadow-lg">
              Maaf, halaman yang Anda cari tidak dapat ditemukan. Mungkin halaman telah dipindahkan atau URL salah.
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a
              href="/"
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
            >
              <i className="fas fa-home mr-2"></i>
              Kembali ke Beranda
            </a>
            {/* <a
              href="/topup"
              className="px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-800 rounded-xl font-semibold hover:bg-white transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl border border-white/50"
            >
              <i className="fas fa-coins mr-2"></i>
              Topup Robux
            </a> */}
          </div>
          
          {/* Popular Links */}
          {/* <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/50">
            <h3 className="font-bold text-gray-800 mb-6 text-xl">
              <i className="fas fa-star mr-2 text-yellow-500"></i>
              Halaman Populer
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href="/"
                className="flex items-center p-4 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 transform hover:scale-105 group"
              >
                <i className="fas fa-home mr-3 w-5 text-blue-500 group-hover:text-blue-600"></i>
                <span className="font-medium">Beranda</span>
              </a>
              <a
                href="/topup"
                className="flex items-center p-4 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-300 transform hover:scale-105 group"
              >
                <i className="fas fa-coins mr-3 w-5 text-purple-500 group-hover:text-purple-600"></i>
                <span className="font-medium">Topup Robux</span>
              </a>
              <a
                href="/#faq"
                className="flex items-center p-4 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-300 transform hover:scale-105 group"
              >
                <i className="fas fa-question-circle mr-3 w-5 text-indigo-500 group-hover:text-indigo-600"></i>
                <span className="font-medium">FAQ</span>
              </a>
              <a
                href="/#contact"
                className="flex items-center p-4 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-300 transform hover:scale-105 group"
              >
                <i className="fas fa-envelope mr-3 w-5 text-green-500 group-hover:text-green-600"></i>
                <span className="font-medium">Kontak</span>
              </a>
            </div> */}
          {/* </div> */}
        </div>
      </main>
      <SimpleFooter />
      <ChatCS />
    </>
  );
}