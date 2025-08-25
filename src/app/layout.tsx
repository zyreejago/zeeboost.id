import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import SplashProvider from "../components/SplashProvider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

// Perbaiki meta description untuk lebih menarik
export const metadata: Metadata = {
  title: {
    default: "ZeeBoost - Topup Robux Termurah & Tercepat #1 di Indonesia 2024",
    template: "%s | ZeeBoost - Topup Robux Terpercaya"
  },
  description: "⚡ Topup Robux TERMURAH & TERCEPAT di Indonesia! Proses 1-30 menit, harga mulai Rp 5.000, 100% AMAN & TERPERCAYA. Sudah 50.000+ gamer puas! Topup sekarang!",
  keywords: [
    "topup robux termurah",
    "beli robux murah indonesia",
    "topup robux cepat",
    "robux murah terpercaya",
    "zeeboost topup robux",
    "beli robux online",
    "topup roblox indonesia",
    "robux generator legal",
    "topup robux termurah indonesia",
    "beli robux murah mulai 5000 rupiah",
    "topup robux cepat 1-30 menit",
    "situs topup robux terpercaya indonesia",
    "cara topup robux murah dan aman",
    "zeeboost topup robux termurah",
    "beli robux online terpercaya indonesia",
    "topup roblox murah proses cepat",
    "harga topup robux termurah 2024",
    "platform topup robux terbaik indonesia",
    "topup robux via qris dana ovo gopay",
    "beli robux murah virtual account",
    "topup robux gamepass terpercaya",
    "cara beli robux murah di indonesia",
    "situs jual robux termurah dan aman",
    "topup robux gamepass murah",
    "beli robux gamepass termurah",
    "topup robux gamepass cepat",
    "cara topup robux gamepass murah",
    "situs topup robux gamepass termurah",
    "topup robux gamepass termurah indonesia",
    "beli robux gamepass murah indonesia",
    "topup robux gamepass cepat indonesia",
    "cara topup robux gamepass murah indonesia",
    "situs topup robux gamepass termurah indonesia",
  ],
  authors: [{ name: "ZeeBoost" }],
  creator: "ZeeBoost",
  publisher: "ZeeBoost",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://zeeboost.com'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon.ico', sizes: '16x16' },
      { url: '/logo-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/logo-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/logo-64.png', sizes: '64x64', type: 'image/png' },
      { url: '/logo-128.png', sizes: '128x128', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/logo-180.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'icon',
        type: 'image/x-icon',
        url: '/favicon.ico',
      },
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/logo-180.png',
      },
    ],
  },
  manifest: '/manifest.json',
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://zeeboost.com",
    title: "ZeeBoost - Topup Robux Terpercaya & Termurah di Indonesia",
    description: "Platform topup Robux terbaik di Indonesia dengan harga terjangkau, proses cepat, dan 100% aman.",
    siteName: "ZeeBoost",
    images: [
      {
        url: 'https://zeeboost.com/logo.png',
        width: 1200,
        height: 630,
        alt: 'ZeeBoost Logo - Platform Topup Robux Terpercaya',
        type: 'image/png',
      },
      {
        url: 'https://zeeboost.com/header_zeeboost.png',
        width: 800,
        height: 400,
        alt: 'ZeeBoost Header',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@zeeboost',
    creator: '@zeeboost',
    title: 'ZeeBoost - Topup Robux Terpercaya & Termurah di Indonesia',
    description: 'Platform topup Robux terbaik di Indonesia dengan harga terjangkau, proses cepat, dan 100% aman.',
    images: {
      url: 'https://zeeboost.com/logo.png',
      alt: 'ZeeBoost Logo - Platform Topup Robux Terpercaya, segera percayakan roblox kamu di zeeboost',
    },
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  themeColor: "#56DFCF",
  colorScheme: 'light',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=AW-17486411883"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-17486411883');
            `,
          }}
        />
        
        {/* Favicon untuk kompatibilitas maksimal */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/logo-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/logo-16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logo-180.png" />
        
        {/* Preconnect untuk performa yang lebih baik */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" />
        
        {/* Font Awesome */}
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
          integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" 
          crossOrigin="anonymous" 
          referrerPolicy="no-referrer" 
        />
        
        {/* Additional SEO Meta Tags */}
        <meta name="application-name" content="ZeeBoost" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ZeeBoost" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#56DFCF" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* Structured Data untuk SEO */}
        {/* LocalBusiness schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "ZeeBoost",
              "description": "Platform topup Robux terpercaya #1 di Indonesia",
              "url": "https://zeeboost.com",
              "telephone": "+62-877-4051-7441",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "ID",
                "addressRegion": "Indonesia"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": "-6.2088",
                "longitude": "106.8456"
              },
              "openingHours": "Mo-Su 00:00-23:59",
              "priceRange": "Rp 5.000 - Rp 500.000",
              "paymentAccepted": "DANA, OVO, GoPay, Bank Transfer"
            })
          }}
        />
        
        {/* Website Schema dengan Sitelinks Searchbox */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "ZeeBoost",
              "url": "https://zeeboost.com",
              "description": "Platform topup Robux terpercaya #1 di Indonesia dengan harga terjangkau, proses super cepat, dan keamanan terjamin.",
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://zeeboost.com/search?q={search_term_string}"
                },
                "query-input": "required name=search_term_string"
              },
              "mainEntity": {
                "@type": "Organization",
                "name": "ZeeBoost",
                "url": "https://zeeboost.com",
                "logo": "https://zeeboost.com/logo.png",
                "sameAs": [
                  "https://www.instagram.com/zeeboost.id"
                ]
              }
            })
          }}
        />
        
        {/* BreadcrumbList Schema */}
        {/* Review schema untuk kredibilitas */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              "name": "ZeeBoost Topup Robux",
              "description": "Layanan topup Robux terpercaya di Indonesia",
              "image": [
                "https://zeeboost.com/favicon.ico",
                "https://zeeboost.com/header_zeeboost.png",
                // "https://zeeboost.com/1.png"
              ],
              "brand": {
                "@type": "Brand",
                "name": "ZeeBoost"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "reviewCount": "2847",
                "bestRating": "5",
                "worstRating": "1"
              },
              "offers": {
                "@type": "Offer",
                "priceCurrency": "IDR",
                "price": "5000",
                "lowPrice": "5000",
                "highPrice": "500000",
                "availability": "https://schema.org/InStock",
                "shippingDetails": {
                  "@type": "OfferShippingDetails",
                  "shippingRate": {
                    "@type": "MonetaryAmount",
                    "value": "0",
                    "currency": "IDR"
                  },
                  "deliveryTime": {
                    "@type": "ShippingDeliveryTime",
                    "handlingTime": {
                      "@type": "QuantitativeValue",
                      "minValue": 1,
                      "maxValue": 30,
                      "unitCode": "MIN"
                    }
                  }
                },
                "hasMerchantReturnPolicy": {
                  "@type": "MerchantReturnPolicy",
                  "applicableCountry": "ID",
                  "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
                  "merchantReturnDays": 7,
                  "returnMethod": "https://schema.org/ReturnByMail"
                }
              },
              "category": "Digital Services",
              "sku": "ZEEBOOST-ROBUX",
              "mpn": "ZB-ROBUX-001",
              "review": [
                {
                  "@type": "Review",
                  "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": "5",
                    "bestRating": "5"
                  },
                  "author": {
                    "@type": "Person",
                    "name": "Ahmad S."
                  },
                  "reviewBody": "Pelayanan sangat cepat dan terpercaya. Robux langsung masuk dalam hitungan menit!"
                },
                {
                  "@type": "Review",
                  "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": "5",
                    "bestRating": "5"
                  },
                  "author": {
                    "@type": "Person",
                    "name": "Sari M."
                  },
                  "reviewBody": "Harga paling murah dan proses sangat mudah. Recommended!"
                }
              ],
              "seller": {
                "@type": "Organization",
                "name": "ZeeBoost",
                "url": "https://zeeboost.com"
              }
            })
          }}
        />
        {/* BreadcrumbList Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://zeeboost.com/"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Topup Robux",
                  "item": "https://zeeboost.com/topup"
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": "Berita",
                  "item": "https://zeeboost.com/news"
                },
                {
                  "@type": "ListItem",
                  "position": 4,
                  "name": "FAQ",
                  "item": "https://zeeboost.com/faq"
                },
                {
                  "@type": "ListItem",
                  "position": 5,
                  "name": "Cara Buat Gamepass",
                  "item": "https://zeeboost.com/gamepass-guide"
                },
                {
                  "@type": "ListItem",
                  "position": 6,
                  "name": "Backup Code Guide",
                  "item": "https://zeeboost.com/backup-code-guide"
                },
                {
                  "@type": "ListItem",
                  "position": 7,
                  "name": "Cek Pesanan",
                  "item": "https://zeeboost.com/check-order"
                },
                {
                  "@type": "ListItem",
                  "position": 8,
                  "name": "Syarat & Ketentuan",
                  "item": "https://zeeboost.com/terms"
                }
              ]
            })
          }}
        />
        {/* Organization Schema untuk Logo */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "ZeeBoost",
              "url": "https://zeeboost.com",
              "logo": "https://zeeboost.com/logo.png",
              "description": "Platform topup Robux terpercaya dan termurah di Indonesia",
              "sameAs": [
                "https://zeeboost.com"
              ]
            })
          }}
        />
      </head>
      <body className={`${poppins.variable} antialiased`}>
        <SplashProvider>
          {children}
        </SplashProvider>
      </body>
    </html>
  );
}
