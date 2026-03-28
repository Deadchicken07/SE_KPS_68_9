'use client'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Staff } from '@/types/staff.types';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export const useStaff = () => {
    const [staffs, setStaffs] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStaffs = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.get<Staff[]>(`${API}/users/staff`, { withCredentials: true });
            setStaffs(res.data);
        } catch (err: unknown) {
            setError("ไม่สามารถดึงข้อมูลบุคลากรได้");
            console.error("Error fetching staffs:", err);
        } finally {
            setLoading(false);
        }
    };

    const getStaffById = async (id: number): Promise<Staff | null> => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.get<Staff>(`${API}/users/staff/${id}`, { withCredentials: true });
            return res.data;
        } catch (err: unknown) {
            setError("ไม่สามารถดึงข้อมูลบุคลากรได้");
            console.error(`Error fetching staff with id ${id}:`, err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaffs();
    }, []);

    return {
        staffs,
        loading,
        error,
        fetchStaffs,
        getStaffById
    };
};
