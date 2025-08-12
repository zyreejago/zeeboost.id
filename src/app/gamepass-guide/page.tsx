'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
// import Banner from '@/components/Banner'; // Hapus import Banner
import Footer from '@/components/Footer';
import MarkdownContent from '@/components/MarkdownContent';
import Head from 'next/head';

// export const metadata = {
//   title: 'Cara Membuat Gamepass Roblox | Tutorial Lengkap - ZeeBoost',
//   description: 'Panduan lengkap cara membuat gamepass di Roblox dengan mudah dan cepat. Dapatkan penghasilan Robux dari game Anda dengan gamepass. Tutorial step by step untuk pemula.',
//   keywords: 'cara membuat gamepass, tutorial gamepass roblox, buat gamepass roblox, panduan gamepass, gamepass untuk pemula, menghasilkan robux dari gamepass',
//   openGraph: {
//     title: 'Cara Membuat Gamepass Roblox | Tutorial Lengkap - ZeeBoost',
//     description: 'Panduan lengkap cara membuat gamepass di Roblox dengan mudah dan cepat. Dapatkan penghasilan Robux dari game Anda dengan gamepass.',
//     images: ['/header zeeboost.png'],
//   },
// };

export default function GamepassGuidePage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulasi loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const markdownContent = `
# Cara Membuat Gamepass di Roblox: Panduan Lengkap (Versi Desktop)

Gamepass adalah fitur di Roblox yang memungkinkan developer menjual akses khusus atau item eksklusif kepada pemain. Dengan gamepass, Anda bisa mendapatkan Robux dari game yang Anda buat. Berikut panduan lengkap cara membuat gamepass di Roblox menggunakan komputer/laptop.

## Apa Itu Gamepass?

Gamepass adalah item digital yang dapat dibeli oleh pemain untuk mendapatkan akses ke fitur khusus, kemampuan, atau konten eksklusif dalam game Roblox. Developer dapat menetapkan harga untuk gamepass dan mendapatkan 70% dari penjualan (setelah dikurangi biaya platform).

## Keuntungan Menggunakan Gamepass

- Sumber penghasilan Robux yang stabil
- Memberikan nilai tambah bagi pemain
- Meningkatkan engagement pemain
- Memungkinkan monetisasi game tanpa iklan berlebihan

## Langkah-Langkah Membuat Gamepass (Versi Desktop)
`;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Custom Banner dengan style dari Banner.tsx tapi gambar statis */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative overflow-hidden rounded-xl shadow-lg bg-gray-100">
          <img
            src="/header zeeboost.png"
            alt="Gamepass Guide Banner"
            className="w-full h-auto aspect-[1920/648] rounded-xl object-cover"
          />
        </div>
      </div>
      
      {/* Judul di bawah banner */}
      <div className="text-center mt-4 mb-8">
        <h1 className="text-4xl font-bold text-black">Cara buat <span className="text-primary">gamepass</span> di Roblox</h1>
      </div>
      
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
          {/* Section 1 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Buka Roblox dan Klik Menu "Buat"</h2>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2">
                <p className="text-gray-700 mb-4">
                  Langkah pertama adalah membuka website Roblox di komputer Anda dan klik menu "Buat" yang ada di bagian atas website.
                </p>
              </div>
              <div className="md:w-1/2">
                <Image 
                  src="/1.png" 
                  alt="Buka Roblox dan Klik Menu Buat" 
                  width={500} 
                  height={300}
                  className="rounded-lg shadow-md"
                />
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Klik "Dashboard"</h2>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2 order-2 md:order-1">
                <Image 
                  src="/2.png" 
                  alt="Klik Dashboard" 
                  width={500} 
                  height={300}
                  className="rounded-lg shadow-md"
                />
              </div>
              <div className="md:w-1/2 order-1 md:order-2">
                <p className="text-gray-700 mb-4">
                  Setelah masuk ke menu Buat, klik opsi "Dashboard" untuk mengakses panel kontrol pengembang Anda.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Klik "Creations" dan Pilih Game/Map Anda</h2>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2">
                <p className="text-gray-700 mb-4">
                  Di dashboard, klik menu "Creations" atau "Kreasi", kemudian pilih game atau map yang ingin Anda tambahkan gamepass.
                </p>
              </div>
              <div className="md:w-1/2">
                <Image 
                  src="/3.png" 
                  alt="Klik Creations dan Pilih Game" 
                  width={500} 
                  height={300}
                  className="rounded-lg shadow-md"
                />
              </div>
            </div>
          </div>

          {/* Section 4 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Cari Menu "Monetizatiton" dan Klik "Passes"</h2>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2 order-2 md:order-1">
                <Image 
                  src="/4.jpg" 
                  alt="Cari Menu Monetize dan Klik Passes" 
                  width={500} 
                  height={300}
                  className="rounded-lg shadow-md"
                />
              </div>
              <div className="md:w-1/2 order-1 md:order-2">
                <p className="text-gray-700 mb-4">
                  Di sidebar kiri, scroll ke bawah sampai menemukan menu "Monetizatition", kemudian klik sub-menu "Passes" untuk membuat gamepass baru.
                </p>
              </div>
            </div>
          </div>

          {/* Section 5 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Buat Pass Baru</h2>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2">
                <p className="text-gray-700 mb-4">
                  Klik tombol "Create Pass" atau "Buat Pass". Isikan nama dan deskripsi bebas sesuai keinginan Anda (hindari menggunakan nama orang atau nama ZeeBoost), lalu klik "Create Pass".
                </p>
              </div>
              <div className="md:w-1/2">
                <Image 
                  src="/5.png" 
                  alt="Buat Pass Baru" 
                  width={500} 
                  height={300}
                  className="rounded-lg shadow-md"
                />
              </div>
            </div>
          </div>

          {/* Section 6 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Klik Gamepass yang Sudah Dibuat</h2>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2 order-2 md:order-1">
                <Image 
                  src="/6.png" 
                  alt="Klik Gamepass yang Sudah Dibuat" 
                  width={500} 
                  height={300}
                  className="rounded-lg shadow-md"
                />
              </div>
              <div className="md:w-1/2 order-1 md:order-2">
                <p className="text-gray-700 mb-4">
                  Setelah gamepass berhasil dibuat, klik gamepass tersebut untuk mengatur harga dan pengaturan lainnya.
                </p>
              </div>
            </div>
          </div>

          {/* Section 7 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Atur Harga dan Matikan Regional Pricing</h2>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2">
                <p className="text-gray-700 mb-4">
                  Di sidebar kiri, klik menu "Sales" atau "Penjualan". Aktifkan opsi "Item for Sale", lalu atur harga sesuai dengan arahan yang telah ditetapkan oleh ZeeBoost agar bisa diverifikasi.
                </p>
                <p className="text-gray-700 mb-4">
                  Setelah selesai, klik "Save Changes" atau "Simpan Perubahan".
                </p>
                <p className="text-gray-700 font-bold">
                  Jika GAMEPASS kamu sudah tertulis DISABLED / NON AKTIF artinya sudah benar dan kamu bisa melakukan pembelian robux di website zeeboost.com
                </p>
              </div>
              <div className="md:w-1/2">
                <Image 
                  src="/last.jpg" 
                  alt="Atur Harga dan Matikan Regional Pricing" 
                  width={500} 
                  height={300}
                  className="rounded-lg shadow-md"
                />
              </div>
            </div>
          </div>

          {/* Peringatan Penting */}
          <div className="mb-12 bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
            <h3 className="text-xl font-bold text-red-700 mb-3">⚠️ Peringatan Penting</h3>
            <p className="text-gray-800 mb-3">
              Ketika mengatur gamepass Anda, sangat penting untuk <span className="font-bold text-red-600">MENONAKTIFKAN fitur "REGIONAL PRICING"</span>. Mengaktifkan fitur ini dapat menyebabkan jumlah Robux yang masuk ke akun Anda berkurang secara signifikan dari nilai yang seharusnya.
            </p>
            <p className="text-gray-800 mb-3">
              Setelah mengatur semua pengaturan dengan benar, jangan lupa untuk mengklik tombol "Save Changes" atau "Simpan Perubahan" untuk menyimpan konfigurasi gamepass Anda.
            </p>
           
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 bg-gradient-to-r from-primary to-primary-dark rounded-xl shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Butuh Robux untuk Mengembangkan Game?</h2>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            ZeeBoost menyediakan layanan top-up Robux dengan harga terbaik dan proses cepat. Dapatkan Robux untuk mengembangkan game Anda sekarang!
          </p>
          <Link href="/topup" className="inline-block bg-white text-primary font-medium px-6 py-3 rounded-lg shadow-sm hover:bg-gray-100 transition-all transform hover:scale-105">
            Top-up Robux Sekarang
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}