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
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://zeeboost.com",
    title: "ZeeBoost - Topup Robux Terpercaya & Termurah di Indonesia",
    description: "Platform topup Robux terbaik di Indonesia dengan harga terjangkau, proses cepat, dan 100% aman.",
    siteName: "ZeeBoost",
  },
  robots: {
    index: true,
    follow: true,
  },
  themeColor: "#56DFCF",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
          integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" 
          crossOrigin="anonymous" 
          referrerPolicy="no-referrer" 
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
