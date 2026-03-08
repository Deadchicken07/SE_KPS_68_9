import { useEffect, useState } from "react";
import axios from "axios";

interface LocationItem {
  id: number;
  name: string;
}

export const useLocationDropdown = () => {
  const [provinces, setProvinces] = useState<LocationItem[]>([]);
  const [districts, setDistricts] = useState<LocationItem[]>([]);
  const [subDistricts, setSubDistricts] = useState<LocationItem[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
  const [selectedSubDistrict, setSelectedSubDistrict] = useState<number | null>(null);

  const API = "http://localhost:4000/location";

  // โหลดจังหวัดครั้งเดียว
  useEffect(() => {
    fetchProvinces();
  }, []);

  const fetchProvinces = async () => {
    try {
      const res = await axios.get<LocationItem[]>(`${API}/provinces`);
      setProvinces(res.data);
    } catch (error) {
      console.error("โหลดจังหวัดไม่สำเร็จ", error);
    }
  };

  const fetchDistricts = async (provinceId: number) => {
    try {
      const res = await axios.get<LocationItem[]>(`${API}/districts`, {
        params: { provinceId },
      });
      setDistricts(res.data);
    } catch (error) {
      console.error("โหลดอำเภอไม่สำเร็จ", error);
    }
  };

  const fetchSubDistricts = async (districtId: number) => {
    try {
      const res = await axios.get<LocationItem[]>(`${API}/sub-districts`, {
        params: { districtId },
      });
      setSubDistricts(res.data);
    } catch (error) {
      console.error("โหลดตำบลไม่สำเร็จ", error);
    }
  };

  // เมื่อเลือกจังหวัด
  useEffect(() => {
    if (selectedProvince !== null) {
      fetchDistricts(selectedProvince);
      setSelectedDistrict(null);
      setSelectedSubDistrict(null);
      setSubDistricts([]);
    }
  }, [selectedProvince]);

  // เมื่อเลือกอำเภอ
  useEffect(() => {
    if (selectedDistrict !== null) {
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
  };
};