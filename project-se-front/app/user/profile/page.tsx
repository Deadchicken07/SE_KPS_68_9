"use client";

import { useEffect, useState } from "react";
import PageSkeleton from "@/components/ui/PageSkeleton";
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

function displayValue(value: string) {
  return value.trim() || "-";
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

  if (isLoading) {
    return <PageSkeleton cards={[{ rows: 4 }, { rows: 4 }, { rows: 4 }]} />;
  }

  return (
    <main className={styles.page}>
      {isLoading ? (
        <div className={styles.feedback}>กำลังโหลดข้อมูลโปรไฟล์...</div>
      ) : (
        <>
          <header className={styles.pageHeader}>
            {/* <span className={styles.pageKicker}>USER AREA</span> */}
            <h1 className={styles.pageTitle}>Profile</h1>
          </header>

          {error ? (
            <div className={`${styles.feedback} ${styles.feedbackError}`} role="alert">
              {error}
            </div>
          ) : null}

          <div className={styles.contentGrid}>
            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.panelEyebrow}>Contact</p>
                  <h2 className={styles.panelTitle}>ข้อมูลติดต่อ</h2>
                </div>
              </div>

              <div className={styles.fieldGrid}>
                <article className={styles.fieldCard}>
                  <span className={styles.fieldLabel}>ชื่อ</span>
                  <p className={styles.fieldValue}>{displayValue(savedProfile.firstName)}</p>
                </article>
                <article className={styles.fieldCard}>
                  <span className={styles.fieldLabel}>นามสกุล</span>
                  <p className={styles.fieldValue}>{displayValue(savedProfile.lastName)}</p>
                </article>
                <article className={styles.fieldCard}>
                  <span className={styles.fieldLabel}>เบอร์โทรศัพท์</span>
                  <p className={styles.fieldValue}>{displayValue(savedProfile.phone)}</p>
                </article>
                <article className={styles.fieldCard}>
                  <span className={styles.fieldLabel}>อีเมล</span>
                  <p className={styles.fieldValue}>{displayValue(savedProfile.email)}</p>
                </article>
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.panelEyebrow}>Health</p>
                  <h2 className={styles.panelTitle}>ข้อมูลสุขภาพเบื้องต้น</h2>
                </div>
              </div>

              <div className={styles.fieldGrid}>
                <article className={styles.fieldCard}>
                  <span className={styles.fieldLabel}>โรคประจำตัว</span>
                  <p className={styles.fieldValue}>{displayValue(savedProfile.chronicDisease)}</p>
                </article>
                <article className={styles.fieldCard}>
                  <span className={styles.fieldLabel}>ประวัติแพ้ยา</span>
                  <p className={styles.fieldValue}>{displayValue(savedProfile.allergies)}</p>
                </article>
              </div>
            </section>

            <section className={`${styles.panel} ${styles.panelWide}`}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.panelEyebrow}>Address</p>
                  <h2 className={styles.panelTitle}>ข้อมูลที่อยู่</h2>
                </div>
              </div>

              <div className={styles.addressGrid}>
                <article className={styles.addressCard}>
                  <span className={styles.fieldLabel}>ที่อยู่ปัจจุบัน</span>
                  <p className={styles.addressValue}>{displayValue(savedProfile.currentAddress)}</p>
                </article>
                <article className={styles.addressCard}>
                  <span className={styles.fieldLabel}>ที่อยู่ตามทะเบียนบ้าน</span>
                  <p className={styles.addressValue}>{displayValue(savedProfile.shippingAddress)}</p>
                </article>
              </div>
            </section>
          </div>
        </>
      )}
    </main>
  );
}
