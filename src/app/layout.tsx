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

export const metadata: Metadata = {
  title: {
    default: "ZeeBoost - Topup Robux Terpercaya & Termurah di Indonesia",
    template: "%s | ZeeBoost"
  },
  description: "Platform topup Robux terbaik di Indonesia dengan harga terjangkau, proses cepat, dan 100% aman. Dapatkan Robux untuk game Roblox favorit Anda sekarang juga!",
  keywords: [
    "topup robux",
    "beli robux",
    "robux murah",
    "topup roblox",
    "robux indonesia",
    "zeeboost",
    "roblox topup",
    "robux terpercaya"
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
      { url: '/logo-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/logo-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/logo-64.png', sizes: '64x64', type: 'image/png' },
      { url: '/logo-128.png', sizes: '128x128', type: 'image/png' },
    ],
    shortcut: '/logo-32.png',
    apple: [
      { url: '/logo-180.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
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
    description: "Platform topup Robux terbaik di Indonesia dengan harga terjangkau, proses cepat, dan 100% aman. Dapatkan Robux untuk game Roblox favorit Anda sekarang juga!",
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
        url: 'https://zeeboost.com/logo-512.png',
        width: 512,
        height: 512,
        alt: 'ZeeBoost Logo',
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "ZeeBoost",
              "url": "https://zeeboost.com",
              "logo": "https://zeeboost.com/logo.png",
              "description": "Platform topup Robux terbaik di Indonesia dengan harga terjangkau, proses cepat, dan 100% aman.",
              "sameAs": [
                "https://www.facebook.com/zeeboost",
                "https://www.twitter.com/zeeboost",
                "https://www.instagram.com/zeeboost.id"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "areaServed": "ID",
                "availableLanguage": "Indonesian"
              }
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
