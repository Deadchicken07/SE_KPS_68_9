"use client";

import axios from "axios";
import { useEffect, useRef } from "react";

const AUTH_PAGES = ["/login", "/login/regis"];

export default function AxiosSessionGuard() {
  const isRedirectingRef = useRef(false);

  useEffect(() => {
    const interceptorId = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (!axios.isAxiosError(error) || error.response?.status !== 401) {
          return Promise.reject(error);
        }

        const requestUrl = error.config?.url ?? "";
        const pathname = window.location.pathname;
        const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page));
        const isLoginRequest = requestUrl.includes("/auth/login");

        if (!isAuthPage && !isLoginRequest && !isRedirectingRef.current) {
          isRedirectingRef.current = true;
          localStorage.removeItem("access_token");
          window.location.replace(
            `/login?expired=1&redirect=${encodeURIComponent(pathname)}`,
          );
        }

        return Promise.reject(error);
      },
    );

    return () => {
      axios.interceptors.response.eject(interceptorId);
    };
  }, []);

  return null;
}
