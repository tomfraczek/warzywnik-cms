import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Providers from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Warzywnik CMS",
  description: "Panel zarządzania warzywnikiem",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="flex min-h-screen bg-zinc-50 text-zinc-900">
            <aside className="w-64 border-r border-zinc-200 bg-white">
              <div className="px-6 py-6 text-sm font-semibold uppercase tracking-wide text-zinc-400">
                Warzywnik
              </div>
              <nav className="flex flex-col gap-2 px-4 pb-6">
                <Link
                  className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
                  href="/"
                >
                  Dashboard
                </Link>
                <Link
                  className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
                  href="/vegetables"
                >
                  Warzywa
                </Link>
                <Link
                  className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
                  href="/soils"
                >
                  Gleby
                </Link>
                <Link
                  className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
                  href="/pests"
                >
                  Szkodniki
                </Link>
                <Link
                  className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
                  href="/diseases"
                >
                  Choroby
                </Link>
              </nav>
            </aside>
            <main className="flex-1 px-10 py-8">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
