"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

type UiMode = "normal" | "loading" | "error";
type PatientScenario = "normal" | "empty";

type ConsultationRecord = {
  id: number;
  created_at: string;
  note: string;
};

type PatientProfile = {
  label: string;
  full_name: string;
  user_id: number;
  gender: string;
  birth_date: string;
  phone: string;
  blood_group: string;
  rights: string;
  chronic_disease: string;
  drug_allergy: string;
  emergency_contact: string;
  records: ConsultationRecord[];
};

const patients: Record<PatientScenario, PatientProfile> = {
  normal: {
    label: "คนที่มีประวัติการรักษาปกติ",
    full_name: "ศิริพร ใจดี",
    user_id: 712,
    gender: "หญิง",
    birth_date: "1998-04-12",
    phone: "089-123-4567",
    blood_group: "A",
    rights: "บัตรทอง (สิทธิหลักประกันสุขภาพ)",
    chronic_disease: "ภูมิแพ้",
    drug_allergy: "ไม่มี",
    emergency_contact: "สมชาย ใจดี (บิดา) 081-555-1212",
    records: [
      {
        id: 23091,
        created_at: "2026-03-01 09:40",
        note: "ติดตามอาการหลังรับยา ไข้ลดลงแล้วและอาการดีขึ้น",
      },
      {
        id: 23032,
        created_at: "2026-02-27 14:15",
        note: "มีอาการไอแห้งตอนกลางคืน แนะนำติดตามผลภายใน 48 ชั่วโมง",
      },
      {
        id: 22988,
        created_at: "2026-02-23 08:22",
        note: "ประเมินอาการเบื้องต้นและให้คำแนะนำการพักผ่อน",
      },
    ],
  },
  empty: {
    label: "คนที่ไม่เคยมีประวัติการรักษา",
    full_name: "มณีรัตน์ บุญยืน",
    user_id: 993,
    gender: "หญิง",
    birth_date: "2001-12-22",
    phone: "095-311-4420",
    blood_group: "O",
    rights: "ชำระเงินเอง",
    chronic_disease: "ไม่มี",
    drug_allergy: "ไม่ทราบ",
    emergency_contact: "กิตติ บุญยืน (พี่ชาย) 080-228-6610",
    records: [],
  },
};

const uiModeText: Record<UiMode, string> = {
  normal: "ปกติ",
  loading: "จำลองโหลดช้า",
  error: "จำลองโหลดล้มเหลว",
};

const formatDateTime = (value: string) => {
  const date = new Date(value.replace(" ", "T"));
  const formattedDate = date.toLocaleDateString("th-TH", { dateStyle: "medium" });
  const formattedTime = date.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${formattedDate} | ${formattedTime}`;
};

const formatBirthDate = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("th-TH", { dateStyle: "long" });

export default function PatientHistoryPage() {
  const [selectedScenario, setSelectedScenario] = useState<PatientScenario>("normal");
  const [uiMode, setUiMode] = useState<UiMode>("normal");
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const patient = patients[selectedScenario];

  const latestRecord = useMemo(() => {
    if (patient.records.length === 0) {
      return null;
    }
    return patient.records[0];
  }, [patient.records]);

  useEffect(() => {
    if (uiMode !== "loading") {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 1300);
    return () => clearTimeout(timer);
  }, [uiMode, selectedScenario]);

  useEffect(() => {
    const updateButtonVisibility = () => {
      const hasLongContent = document.documentElement.scrollHeight > window.innerHeight + 320;
      const hasScrolledDown = window.scrollY > 260;
      setShowScrollTop(hasLongContent && hasScrolledDown);
    };

    updateButtonVisibility();
    window.addEventListener("scroll", updateButtonVisibility, { passive: true });
    window.addEventListener("resize", updateButtonVisibility);
    return () => {
      window.removeEventListener("scroll", updateButtonVisibility);
      window.removeEventListener("resize", updateButtonVisibility);
    };
  }, []);

  const shouldShowData = !isLoading && uiMode !== "error";

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <h1>ประวัติผู้ป่วย</h1>
        <p>ข้อมูลนี้แสดงเฉพาะข้อมูลประวัติของคุณ ({patient.full_name}) เท่านั้น</p>

        <div className={styles.controlsPanel}>
          <div className={styles.controlGroup}>
            <label htmlFor="patient-select">เลือกผู้ป่วยจำลอง</label>
            <select
              id="patient-select"
              value={selectedScenario}
              onChange={(event) => setSelectedScenario(event.target.value as PatientScenario)}
            >
              <option value="normal">{patients.normal.label}</option>
              <option value="empty">{patients.empty.label}</option>
            </select>
          </div>

          <div className={styles.controlGroup}>
            <label htmlFor="mode-select">โหมดการแสดงผลระบบ</label>
            <select
              id="mode-select"
              value={uiMode}
              onChange={(event) => setUiMode(event.target.value as UiMode)}
            >
              <option value="normal">{uiModeText.normal}</option>
              <option value="loading">{uiModeText.loading}</option>
              <option value="error">{uiModeText.error}</option>
            </select>
          </div>
        </div>
      </section>

      <section className={styles.contentSection}>
        {isLoading && (
          <div className={styles.stateCard}>
            <h3>กำลังโหลดข้อมูลประวัติผู้ป่วย...</h3>
            <p>โปรดรอสักครู่ ระบบกำลังดึงข้อมูลให้คุณ</p>
          </div>
        )}

        {!isLoading && uiMode === "error" && (
          <div className={`${styles.stateCard} ${styles.errorCard}`}>
            <h3>ไม่สามารถดึงข้อมูลได้ในขณะนี้</h3>
            <p>กรุณาเปลี่ยนเป็นโหมดปกติ หรือรีเฟรชหน้าอีกครั้ง</p>
          </div>
        )}

        {shouldShowData && (
          <>
            <article className={styles.infoCard}>
              <h2>ข้อมูลส่วนตัว</h2>
              <div className={styles.grid}>
                <div className={styles.field}>
                  <span>ชื่อ-นามสกุล</span>
                  <strong>{patient.full_name}</strong>
                </div>
                <div className={styles.field}>
                  <span>รหัสผู้ป่วย</span>
                  <strong>{patient.user_id}</strong>
                </div>
                <div className={styles.field}>
                  <span>เพศ</span>
                  <strong>{patient.gender}</strong>
                </div>
                <div className={styles.field}>
                  <span>วันเกิด</span>
                  <strong>{formatBirthDate(patient.birth_date)}</strong>
                </div>
                <div className={styles.field}>
                  <span>เบอร์โทร</span>
                  <strong>{patient.phone}</strong>
                </div>
                <div className={styles.field}>
                  <span>สิทธิการรักษา</span>
                  <strong>{patient.rights}</strong>
                </div>
              </div>
            </article>

            <article className={styles.infoCard}>
              <h2>ข้อมูลสุขภาพพื้นฐาน</h2>
              <div className={styles.grid}>
                <div className={styles.field}>
                  <span>หมู่เลือด</span>
                  <strong>{patient.blood_group}</strong>
                </div>
                <div className={styles.field}>
                  <span>โรคประจำตัว</span>
                  <strong>{patient.chronic_disease}</strong>
                </div>
                <div className={styles.field}>
                  <span>ประวัติแพ้ยา</span>
                  <strong>{patient.drug_allergy}</strong>
                </div>
                <div className={styles.field}>
                  <span>ผู้ติดต่อฉุกเฉิน</span>
                  <strong>{patient.emergency_contact}</strong>
                </div>
              </div>
            </article>

            <article className={styles.infoCard}>
              <h2>สรุปการเข้ารับบริการล่าสุด</h2>
              {!latestRecord ? (
                <p className={styles.emptyText}>ยังไม่มีประวัติการเข้ารับบริการ</p>
              ) : (
                <div className={styles.grid}>
                  <div className={styles.field}>
                    <span>วันที่อ้างอิง</span>
                    <strong>{formatDateTime(latestRecord.created_at)}</strong>
                  </div>
                  <div className={styles.field}>
                    <span>รหัสอ้างอิงเคสล่าสุด</span>
                    <strong>#{latestRecord.id}</strong>
                  </div>
                  <div className={`${styles.field} ${styles.full}`}>
                    <span>หมายเหตุย่อ</span>
                    <strong>{latestRecord.note}</strong>
                  </div>
                </div>
              )}
            </article>
          </>
        )}
      </section>

      {showScrollTop && (
        <button
          type="button"
          className={styles.scrollTopButton}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="เลื่อนกลับขึ้นด้านบน"
          title="กลับขึ้นบนสุด"
        >
          <svg
            className={styles.arrowIcon}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="M12 18V6M12 6L7 11M12 6L17 11" />
          </svg>
        </button>
      )}
    </main>
  );
}
