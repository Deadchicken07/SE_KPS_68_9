import type { CSSProperties } from "react";
import type { Metadata } from "next";
import AppThemeProvider from "@/components/ui/AppThemeProvider";
import AxiosSessionGuard from "@/components/providers/AxiosSessionGuard";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";

const rootFontVariables = {
  "--font-geist-sans": '"Noto Sans Thai", "Segoe UI", sans-serif',
  "--font-geist-mono": '"Cascadia Code", "Fira Code", Consolas, monospace',
} as CSSProperties;

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
    <html lang="en" suppressHydrationWarning>
      <body
        className="antialiased"
        style={rootFontVariables}
        suppressHydrationWarning
      >
        <AuthProvider>
          <AppThemeProvider>{children}</AppThemeProvider>
          <AxiosSessionGuard />
        </AuthProvider>
      </body>
    </html>
  );
}
