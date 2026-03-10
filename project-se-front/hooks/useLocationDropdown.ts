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
  const [zipCodes, setZipCodes] = useState<LocationItem[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
  const [selectedSubDistrict, setSelectedSubDistrict] = useState<number | null>(
    null,
  );
  const [selectedZipCode, setSelectedZipCode] = useState<number | null>(null);

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

  const fetchZipCodes = async (subDistrictId: number) => {
    try {
      const res = await axios.get<LocationItem[]>(`${API}/zip-codes`, {
        params: { subDistrictId },
      });
      setZipCodes(res.data);
    } catch (error) {
      console.error("โหลดรหัสไปรษณีย์ไม่สำเร็จ", error);
    }
  };

  // เมื่อเลือกจังหวัด
  useEffect(() => {
    if (selectedProvince !== null) {
      fetchDistricts(selectedProvince);
      setSelectedDistrict(null);
      setSelectedSubDistrict(null);
      setSelectedZipCode(null);
      setSubDistricts([]);
      setZipCodes([]);
    }
  }, [selectedProvince]);

  // เมื่อเลือกอำเภอ
  useEffect(() => {
    if (selectedDistrict !== null) {
      fetchSubDistricts(selectedDistrict);
      setSelectedSubDistrict(null);
      setSelectedZipCode(null);
      setZipCodes([]);
    }
  }, [selectedDistrict]);

  // เมื่อเลือกตำบล
  useEffect(() => {
    if (selectedSubDistrict !== null) {
      fetchZipCodes(selectedSubDistrict);
      setSelectedZipCode(null);
    }
  }, [selectedSubDistrict]);

  return {
    provinces,
    districts,
    subDistricts,
    zipCodes,

    selectedProvince,
    selectedDistrict,
    selectedSubDistrict,
    selectedZipCode,

    setSelectedProvince,
    setSelectedDistrict,
    setSelectedSubDistrict,
    setSelectedZipCode,
  };
};
