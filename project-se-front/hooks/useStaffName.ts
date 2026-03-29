'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL;

const toFullName = (data: { title?: string; name?: string; sur_name?: string }) =>
  [data.title, data.name, data.sur_name].filter(Boolean).join(' ');

export const useStaffName = (id: number | null) => {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    if (!id) { setName(null); return; }
    axios
      .get(`${API}/users/staff/${id}`, { withCredentials: true })
      .then((res) => setName(toFullName(res.data)))
      .catch(() => setName(null));
  }, [id]);

  return name;
};

export const useUserName = (id: number | null) => {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    if (!id) { setName(null); return; }
    axios
      .get(`${API}/users/${id}`, { withCredentials: true })
      .then((res) => setName(toFullName(res.data)))
      .catch(() => setName(null));
  }, [id]);

  return name;
};
