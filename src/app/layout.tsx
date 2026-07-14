import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FilmedIn",
  description: "Ultra-minimalist movie and TV show database.",
};

import Link from 'next/link';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-zinc-950 text-zinc-50 min-h-screen flex flex-col`}>
        <nav className="w-full border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="font-bold text-xl tracking-tighter">FilmedIn</Link>
            <Link href="/profile" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">Profile</Link>
          </div>
        </nav>
        <div className="flex-1">
          {children}
        </div>
      </body>
    </html>
  );
}
