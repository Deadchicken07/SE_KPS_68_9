"use client";

import { User } from "@/types/user.types";
import axios from "axios";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;

export const useUser = () => {
  const [user, setUser] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get<User[]>(`${API}/users/all`);
        setUser(res.data);
      } catch (err: unknown) {
        setError("ไม่สามารถดึงข้อมูลบุคลากรได้");
        console.error("Error fetching staffs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { user, loading, error };
};
