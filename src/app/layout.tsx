import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "বাংলা থাম্বনেইল এডিটর",
  description:
    "মোবাইল থেকেই বাংলা কোট থাম্বনেইল, ইসলামিক পোস্ট, বিবাহ পোস্ট ও সোশ্যাল মিডিয়া গ্রাফিক্স তৈরি করুন — কোনো ডিজাইন স্কিল ছাড়াই।",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#4f46e5",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Preloaded Bengali fonts — must be ready before the canvas measures text */}
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&family=Noto+Serif+Bengali:wght@400;500;700;900&family=Baloo+Da+2:wght@400;600;700;800&family=Tiro+Bangla&family=Anek+Bangla:wght@400;600;700&family=Atma:wght@400;600;700&family=Galada&family=Mina:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
