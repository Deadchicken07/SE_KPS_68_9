"use client";

import axios from "axios";
import { useEffect, useRef } from "react";
import { authPages, userProtectedPrefixes } from "@/types/role.types";

function matchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function isAuthPage(pathname: string) {
  return authPages.some((page) => matchesPrefix(pathname, page));
}

function isProtectedPath(pathname: string) {
  return (
    pathname === "/staff" ||
    matchesPrefix(pathname, "/staff") ||
    userProtectedPrefixes.some((prefix) => matchesPrefix(pathname, prefix))
  );
}

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
        const onAuthPage = isAuthPage(pathname);
        const onProtectedPath = isProtectedPath(pathname);
        const isLoginRequest = requestUrl.includes("/auth/login");

        if (
          onProtectedPath &&
          !onAuthPage &&
          !isLoginRequest &&
          !isRedirectingRef.current
        ) {
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
