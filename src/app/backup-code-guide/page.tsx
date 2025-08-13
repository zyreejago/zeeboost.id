'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MarkdownContent from '@/components/MarkdownContent';
import Head from 'next/head';

export default function BackupCodeGuidePage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulasi loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const _markdownContent = `
# Cara Membuat Backup Code: Panduan Sederhana

Backup code adalah kode cadangan yang sangat penting untuk mengamankan akun Anda. Dengan backup code, Anda bisa mengakses akun meskipun kehilangan akses ke metode autentikasi utama. Berikut panduan sederhana cara membuat backup code.

## Apa Itu Backup Code?

Backup code adalah serangkaian kode alfanumerik yang dapat digunakan untuk mengakses akun Anda ketika metode autentikasi utama (seperti SMS, email, atau aplikasi autentikator) tidak tersedia. Backup code berfungsi sebagai "kunci cadangan" untuk akun Anda.

## Keuntungan Menggunakan Backup Code

- Akses darurat ke akun saat perangkat utama hilang atau rusak
- Perlindungan tambahan untuk akun berharga
- Mencegah kehilangan akses permanen ke akun
- Solusi cepat saat bepergian atau berada di area dengan sinyal terbatas

## Langkah-Langkah Membuat Backup Code
`;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Custom Banner dengan style dari Banner.tsx tapi gambar statis */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative overflow-hidden rounded-xl shadow-lg bg-gray-100">
          <Image
            src="/header zeeboost.png"
            alt="Backup Code Guide Banner"
            width={1920}
            height={648}
            className="w-full h-auto aspect-[1920/648] rounded-xl object-cover"
          />
        </div>
      </div>
      
      {/* Judul di bawah banner */}
      <div className="text-center mt-4 mb-8">
        <h1 className="text-4xl font-bold text-black">Cara membuat <span className="text-primary">backup code</span>!</h1>
      </div>
      
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
          {/* Section 1 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Buka Roblox dan Klik Pengaturan</h2>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2">
                <p className="text-gray-700 mb-4">
                  Langkah pertama adalah membuka situs Roblox dan masuk ke akun Anda. Kemudian, klik ikon roda gigi di pojok kanan atas untuk membuka menu pengaturan akun.
                </p>
              </div>
              <div className="md:w-1/2">
                <Image 
                  src="/satu.png" 
                  alt="Buka Roblox dan Klik Pengaturan" 
                  width={500} 
                  height={300}
                  className="rounded-lg shadow-md"
                />
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Pilih Keamanan di Sidebar dan Klik Buat di Bagian Backup Code</h2>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2 order-2 md:order-1">
                <Image 
                  src="/2.jpg" 
                  alt="Pilih Keamanan dan Klik Buat Backup Code" 
                  width={500} 
                  height={300}
                  className="rounded-lg shadow-md"
                />
              </div>
              <div className="md:w-1/2 order-1 md:order-2">
                <p className="text-gray-700 mb-4">
                  Di menu pengaturan, pilih tab "Keamanan" di sidebar kiri. Kemudian, cari bagian "Backup Code" atau "Kode Pemulihan" dan klik tombol "Buat" untuk menghasilkan kode backup Anda.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Dapatkan 10 Kode Backup</h2>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2">
                <p className="text-gray-700 mb-4">
                  Anda akan diberikan 10 kode backup. Simpan kode-kode ini dengan aman. Saat menggunakan ZeeBoost, Anda hanya perlu memasukkan 3 kode saja. Jangan sebarkan kode backup Anda kepada siapapun.
                </p>
                <p className="text-gray-700 font-bold">
                  Penting: Jangan pernah membagikan semua kode backup Anda kepada siapapun. Untuk ZeeBoost, cukup masukkan 3 kode saja sesuai petunjuk.
                </p>
              </div>
              <div className="md:w-1/2">
                <Image 
                  src="/3.jpg" 
                  alt="Dapatkan 10 Kode Backup" 
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
              Jangan pernah membagikan semua backup code Anda kepada siapapun. Untuk layanan ZeeBoost, Anda hanya perlu memasukkan 3 kode saja sesuai petunjuk.
            </p>
            <p className="text-gray-800 mb-3">
              Simpan backup codes di tempat yang aman. Kode-kode ini memberikan akses ke akun Anda dan harus dijaga kerahasiaannya.
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