"use client";

import axios from "axios";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthMeResponse } from "@/types/auth.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type AuthContextValue = {
  me: AuthMeResponse | null;
  loading: boolean;
  refreshMe: () => Promise<void>;
  setMe: (value: AuthMeResponse | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<AuthMeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    try {
      const response = await axios.get<AuthMeResponse>(`${API_URL}/auth/me`, {
        withCredentials: true,
      });
      setMe(response.data);
    } catch {
      setMe(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshMe();
  }, [refreshMe]);

  const value = useMemo(
    () => ({
      me,
      loading,
      refreshMe,
      setMe,
    }),
    [loading, me, refreshMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
