import { useCallback, useEffect, useState } from "react";
import axios from "axios";

/* eslint-disable react-hooks/set-state-in-effect */

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
  const [selectedSubDistrict, setSelectedSubDistrict] = useState<number | null>(null);
  const [selectedZipCode, setSelectedZipCode] = useState<number | null>(null);

  const api = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  const fetchProvinces = useCallback(async () => {
    try {
      const res = await axios.get<LocationItem[]>(`${api}/location/provinces`);
      setProvinces(res.data);
    } catch (error) {
      console.error("Failed to load provinces", error);
    }
  }, [api]);

  const fetchDistricts = useCallback(
    async (provinceId: number) => {
      try {
        const res = await axios.get<LocationItem[]>(`${api}/location/districts`, {
          params: { provinceId },
        });
        setDistricts(res.data);
      } catch (error) {
        console.error("Failed to load districts", error);
      }
    },
    [api],
  );

  const fetchSubDistricts = useCallback(
    async (districtId: number) => {
      try {
        const res = await axios.get<LocationItem[]>(`${api}/location/sub-districts`, {
          params: { districtId },
        });
        setSubDistricts(res.data);
      } catch (error) {
        console.error("Failed to load sub-districts", error);
      }
    },
    [api],
  );

  const fetchZipCodes = useCallback(
    async (subDistrictId: number) => {
      try {
        const res = await axios.get<LocationItem[]>(`${api}/location/zip-codes`, {
          params: { subDistrictId },
        });
        setZipCodes(res.data);
      } catch (error) {
        console.error("Failed to load zip codes", error);
      }
    },
    [api],
  );

  useEffect(() => {
    void fetchProvinces();
  }, [fetchProvinces]);

  useEffect(() => {
    if (selectedProvince === null) {
      return;
    }

    void fetchDistricts(selectedProvince);
    setSelectedDistrict(null);
    setSelectedSubDistrict(null);
    setSelectedZipCode(null);
    setSubDistricts([]);
    setZipCodes([]);
  }, [fetchDistricts, selectedProvince]);

  useEffect(() => {
    if (selectedDistrict === null) {
      return;
    }

    void fetchSubDistricts(selectedDistrict);
    setSelectedSubDistrict(null);
    setSelectedZipCode(null);
    setZipCodes([]);
  }, [fetchSubDistricts, selectedDistrict]);

  useEffect(() => {
    if (selectedSubDistrict === null) {
      return;
    }

    void fetchZipCodes(selectedSubDistrict);
    setSelectedZipCode(null);
  }, [fetchZipCodes, selectedSubDistrict]);

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
