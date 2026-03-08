import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ClinicLayout from "../components/nav/navTop";
import "./user/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
        <ClinicLayout />
        {children}
      </body>
    </html>
  );
}
