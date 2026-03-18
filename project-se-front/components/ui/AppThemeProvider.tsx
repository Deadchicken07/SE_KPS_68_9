"use client";

import { ConfigProvider, theme as antdTheme } from "antd";
import type { ReactNode } from "react";

type AppThemeProviderProps = {
  children: ReactNode;
};

const BRAND_PRIMARY = "#0f766e";
const BRAND_PRIMARY_HOVER = "#115e59";
const BRAND_PRIMARY_ACTIVE = "#134e4a";
const BRAND_PRIMARY_BG = "#e6fffb";
const BRAND_PRIMARY_BG_HOVER = "#ccfbf1";
const BRAND_PRIMARY_TEXT = "#ffffff";

export default function AppThemeProvider({
  children,
}: AppThemeProviderProps) {
  return (
    <ConfigProvider
      theme={{
        algorithm: antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: BRAND_PRIMARY,
          colorInfo: BRAND_PRIMARY,
          colorLink: BRAND_PRIMARY,
          colorSuccess: BRAND_PRIMARY,
          colorPrimaryHover: BRAND_PRIMARY_HOVER,
          colorPrimaryActive: BRAND_PRIMARY_ACTIVE,
          colorPrimaryBorder: BRAND_PRIMARY,
          colorPrimaryBg: BRAND_PRIMARY_BG,
          colorPrimaryBgHover: BRAND_PRIMARY_BG_HOVER,
          borderRadius: 12,
          fontFamily: 'var(--font-geist-sans), "Noto Sans Thai", sans-serif',
        },
        components: {
          Button: {
            colorPrimary: BRAND_PRIMARY,
            colorPrimaryHover: BRAND_PRIMARY_HOVER,
            colorPrimaryActive: BRAND_PRIMARY_ACTIVE,
            primaryColor: BRAND_PRIMARY_TEXT,
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
