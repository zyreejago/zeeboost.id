'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TermsAndPrivacy() {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>('terms');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Syarat & Ketentuan dan Kebijakan Privasi
          </h1>
          <p className="text-lg text-gray-600">
            ZeeBoost - Platform Top-up Robux Terpercaya
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm border">
            <button
              onClick={() => setActiveTab('terms')}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === 'terms'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Syarat & Ketentuan
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === 'privacy'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Kebijakan Privasi
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          {activeTab === 'terms' ? (
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Syarat & Ketentuan ZeeBoost
              </h2>
              
              <div className="space-y-8">
                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    1. Definisi Layanan
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    ZeeBoost adalah platform top-up Robux yang menyediakan layanan pembelian 
                    Robux untuk game Roblox dengan berbagai metode pembayaran yang aman dan terpercaya.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    2. Penggunaan Layanan
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Pengguna wajib memberikan informasi yang akurat saat melakukan transaksi</li>
                    <li>Setiap transaksi bersifat final setelah berhasil diproses</li>
                    <li>Pengguna bertanggung jawab atas keamanan akun Roblox mereka</li>
                    <li>Dilarang menggunakan layanan untuk tujuan ilegal atau merugikan pihak lain</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    3. Proses Transaksi
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Pastikan username Roblox yang dimasukkan benar dan valid</li>
                    <li>Proses top-up akan dilakukan setelah pembayaran berhasil dikonfirmasi</li>
                    <li>Waktu proses normal adalah 1-24 jam setelah pembayaran berhasil</li>
                    <li>Robux akan langsung masuk ke akun Roblox yang telah ditentukan</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    4. Ketentuan Refund
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Refund hanya dapat diajukan jika terjadi kegagalan transaksi karena kesalahan sistem</li>
                    <li>Refund dapat berupa voucher diskon atau pengembalian dana</li>
                    <li>Proses refund akan diselesaikan dalam waktu maksimal 3 hari kerja</li>
                    <li>Pengajuan refund harus disertai bukti transaksi yang valid</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    5. Pembatasan Tanggung Jawab
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    ZeeBoost tidak bertanggung jawab atas kerugian yang timbul akibat kesalahan 
                    pengguna dalam memasukkan data, masalah pada akun Roblox pengguna, atau 
                    gangguan layanan dari pihak ketiga.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    6. Perubahan Ketentuan
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    ZeeBoost berhak mengubah syarat dan ketentuan ini sewaktu-waktu. 
                    Perubahan akan diumumkan melalui website resmi dan berlaku sejak tanggal publikasi.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    7. Layanan Bantuan
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Untuk bantuan atau pertanyaan, hubungi customer support kami melalui:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 mt-2">
                    <li>WhatsApp: [Nomor WhatsApp Customer Service]</li>
                    <li>Email: [Email Customer Service]</li>
                    <li>Live Chat di website ZeeBoost</li>
                  </ul>
                </section>
              </div>
            </div>
          ) : (
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Kebijakan Privasi ZeeBoost
              </h2>
              
              <div className="space-y-8">
                <section>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    Di ZeeBoost, kami berkomitmen untuk melindungi dan menghormati privasi Anda. 
                    Kebijakan privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, 
                    dan melindungi informasi pribadi Anda saat menggunakan layanan kami.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    1. Informasi yang Kami Kumpulkan
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    Kami dapat mengumpulkan informasi berikut dari pengguna:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Informasi transaksi seperti username Roblox dan metode pembayaran</li>
                    <li>Data teknis seperti alamat IP, jenis perangkat, dan browser</li>
                    <li>Informasi kontak jika Anda menghubungi customer support</li>
                    <li>Log aktivitas saat mengakses website kami</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    2. Penggunaan Informasi
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    Informasi yang kami kumpulkan digunakan untuk:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Memproses dan menyelesaikan transaksi top-up Robux Anda</li>
                    <li>Memberikan layanan customer support yang optimal</li>
                    <li>Meningkatkan performa website dan pengalaman pengguna</li>
                    <li>Mencegah penipuan dan aktivitas mencurigakan</li>
                    <li>Mengirimkan informasi promo jika Anda memberikan persetujuan</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    3. Penyimpanan dan Keamanan Data
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Kami menyimpan informasi Anda secara aman menggunakan sistem keamanan 
                    teknis dan administratif yang sesuai. Kami tidak akan menjual, menyewakan, 
                    atau membagikan data pribadi Anda kepada pihak ketiga tanpa persetujuan Anda, 
                    kecuali diwajibkan oleh hukum.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    4. Cookies dan Teknologi Pelacakan
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Kami dapat menggunakan cookies atau teknologi serupa untuk mengumpulkan 
                    data aktivitas pengguna di website kami guna meningkatkan pengalaman 
                    dan efisiensi layanan.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    5. Hak Anda
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    Sebagai pengguna, Anda berhak untuk:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Meminta informasi tentang data pribadi yang kami simpan</li>
                    <li>Memperbarui atau memperbaiki informasi yang tidak akurat</li>
                    <li>Meminta penghapusan data Anda dari sistem kami (sesuai ketentuan berlaku)</li>
                    <li>Menolak penggunaan data untuk tujuan pemasaran</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    6. Pembagian Informasi dengan Pihak Ketiga
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Kami hanya membagikan informasi Anda dengan pihak ketiga dalam situasi berikut:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 mt-3">
                    <li>Untuk memproses pembayaran melalui payment gateway yang aman</li>
                    <li>Jika diwajibkan oleh hukum atau otoritas yang berwenang</li>
                    <li>Untuk melindungi hak, properti, atau keamanan ZeeBoost dan pengguna</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    7. Perubahan Kebijakan
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Kebijakan privasi ini dapat diperbarui dari waktu ke waktu. Setiap perubahan 
                    akan diumumkan melalui website resmi ZeeBoost, dan versi terbaru akan selalu 
                    tersedia untuk Anda tinjau.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    8. Kontak
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Jika Anda memiliki pertanyaan terkait privasi atau pengelolaan data Anda, 
                    silakan hubungi kami melalui:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 mt-2">
                    <li>WhatsApp CS ZeeBoost: [Nomor WhatsApp]</li>
                    <li>Email: [Email Customer Service]</li>
                    <li>Live Chat di website ZeeBoost</li>
                  </ul>
                </section>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="text-center mt-8 text-gray-500">
          <p>Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}</p>
          <p className="mt-2">ZeeBoost - Platform Top-up Robux Terpercaya</p>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}