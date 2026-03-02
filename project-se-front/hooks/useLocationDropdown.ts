import { useEffect, useState } from 'react';
import axios from 'axios';

export const useLocationDropdown = () => {
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [subDistricts, setSubDistricts] = useState<any[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
  const [selectedSubDistrict, setSelectedSubDistrict] = useState<number | null>(null);

  const API = 'http://localhost:4000/location'; // ปรับตามของคุณ

  // โหลดจังหวัดตอนเริ่ม
  useEffect(() => {
    fetchProvinces();
  }, []);

  const fetchProvinces = async (q?: string) => {
    const res = await axios.get(`${API}/provinces`, {
      params: { q },
    });
    setProvinces(res.data);
  };

  const fetchDistricts = async (provinceId: number, q?: string) => {
    const res = await axios.get(`${API}/districts`, {
      params: { provinceId, q },
    });
    setDistricts(res.data);
  };

  const fetchSubDistricts = async (districtId: number, q?: string) => {
    const res = await axios.get(`${API}/sub-districts`, {
      params: { districtId, q },
    });
    setSubDistricts(res.data);
  };

  // เมื่อเลือกจังหวัด
  useEffect(() => {
    if (selectedProvince) {
      fetchDistricts(selectedProvince);
      setSelectedDistrict(null);
      setSelectedSubDistrict(null);
      setSubDistricts([]);
    }
  }, [selectedProvince]);

  // เมื่อเลือกอำเภอ
  useEffect(() => {
    if (selectedDistrict) {
      fetchSubDistricts(selectedDistrict);
      setSelectedSubDistrict(null);
    }
  }, [selectedDistrict]);

  return {
    provinces,
    districts,
    subDistricts,
    selectedProvince,
    selectedDistrict,
    selectedSubDistrict,
    setSelectedProvince,
    setSelectedDistrict,
    setSelectedSubDistrict,
    fetchProvinces,
    fetchDistricts,
    fetchSubDistricts,
  };
};