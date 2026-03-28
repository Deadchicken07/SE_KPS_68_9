import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Script from "next/script";
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

const hydrationAttributeCleanupScript = `
  (() => {
    const attributeNames = ["bis_skin_checked"];

    const cleanup = (root) => {
      for (const attributeName of attributeNames) {
        const selector = "[" + attributeName + "]";
        root.querySelectorAll(selector).forEach((node) => {
          node.removeAttribute(attributeName);
        });
      }
    };

    cleanup(document);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName &&
          attributeNames.includes(mutation.attributeName)
        ) {
          mutation.target.removeAttribute(mutation.attributeName);
          continue;
        }

        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof Element) {
              cleanup(node);
            }
          });
        }
      }
    });

    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: attributeNames,
    });
  })();
`;

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
        <Script id="hydration-attribute-cleanup" strategy="beforeInteractive">
          {hydrationAttributeCleanupScript}
        </Script>
        <AuthProvider>
          <AppThemeProvider>{children}</AppThemeProvider>
          <AxiosSessionGuard />
        </AuthProvider>
      </body>
    </html>
  );
}
