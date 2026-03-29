import type { Metadata } from "next";

import localFont from "next/font/local";
import AppThemeProvider from "@/components/ui/AppThemeProvider";
import AxiosSessionGuard from "@/components/providers/AxiosSessionGuard";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";

const geistSans = localFont({
  src: "./fonts/geist-latin.woff2",
  variable: "--font-geist-sans",
});

const geistMono = localFont({
  src: "./fonts/geist-mono-latin.woff2",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "JitDee.com",
  description: "JitDee.com",
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
        <AuthProvider>
          <AppThemeProvider>{children}</AppThemeProvider>
          <AxiosSessionGuard />
        </AuthProvider>
      </body>
    </html>
  );
}
