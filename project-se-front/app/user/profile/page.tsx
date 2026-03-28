"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type PatientProfile = {
  patientCode: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  chronicDisease: string;
  allergies: string;
  currentAddress: string;
  shippingAddress: string;
};

const defaultProfile: PatientProfile = {
  patientCode: "",
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  chronicDisease: "",
  allergies: "",
  currentAddress: "",
  shippingAddress: "",
};

type ApiError = {
  message?: string | string[];
};

function parseApiError(payload: ApiError | null, fallbackMessage: string) {
  if (Array.isArray(payload?.message)) {
    return payload.message[0] ?? fallbackMessage;
  }

  return payload?.message || fallbackMessage;
}

export default function UserProfilePage() {
  const [savedProfile, setSavedProfile] = useState<PatientProfile>(defaultProfile);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!error) {
      return;
    }

    const timer = window.setTimeout(() => {
      setError("");
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [error]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/users/me/profile`, {
          credentials: "include",
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as ApiError | null;
          throw new Error(parseApiError(payload, "ไม่สามารถโหลดข้อมูลโปรไฟล์ได้"));
        }

        const profile = (await response.json()) as PatientProfile;
        setSavedProfile(profile);
      } catch (err) {
        setError(err instanceof Error ? err.message : "ไม่สามารถโหลดข้อมูลโปรไฟล์ได้");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchProfile();
  }, []);

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.header}>
          <div>
            <h1>ข้อมูลส่วนตัวผู้ป่วย</h1>
            {error ? <p className={styles.errorText}>{error}</p> : null}
          </div>
        </div>

        {isLoading ? <p className={styles.loadingText}>กำลังโหลดข้อมูลโปรไฟล์...</p> : null}

        <div className={styles.formGrid}>
          <label>
            ชื่อ
            <input name="firstName" value={savedProfile.firstName} disabled />
          </label>

          <label>
            นามสกุล
            <input name="lastName" value={savedProfile.lastName} disabled />
          </label>

          <label>
            เบอร์โทรศัพท์
            <input name="phone" value={savedProfile.phone} disabled />
          </label>

          <label>
            อีเมล
            <input name="email" value={savedProfile.email} disabled />
          </label>

          <label>
            โรคประจำตัว
            <input name="chronicDisease" value={savedProfile.chronicDisease} disabled />
          </label>

          <label>
            ประวัติแพ้ยา
            <input name="allergies" value={savedProfile.allergies} disabled />
          </label>

          <label className={styles.fullWidth}>
            ที่อยู่ปัจจุบัน
            <textarea name="currentAddress" value={savedProfile.currentAddress} rows={3} disabled />
          </label>

          <label className={styles.fullWidth}>
            ที่อยู่การจัดส่งยา
            <textarea name="shippingAddress" value={savedProfile.shippingAddress} rows={3} disabled />
          </label>
        </div>
      </section>
    </main>
  );
}
