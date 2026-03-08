"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

type PatientProfile = {
  patientCode: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  birthDate: string;
  gender: string;
  bloodGroup: string;
  chronicDisease: string;
  allergies: string;
  emergencyContact: string;
  address: string;
};

const defaultProfile: PatientProfile = {
  patientCode: "PT-000712",
  firstName: "ศิริพร",
  lastName: "ใจดี",
  phone: "0891234567",
  email: "siriporn.patient@example.com",
  birthDate: "1998-04-12",
  gender: "หญิง",
  bloodGroup: "A",
  chronicDisease: "ภูมิแพ้อากาศ",
  allergies: "ไม่พบประวัติแพ้ยา",
  emergencyContact: "สมชาย ใจดี 0815551212",
  address: "99/12 ถนนสุขุมวิท แขวงคลองตัน เขตวัฒนา กรุงเทพมหานคร 10110",
};

export default function UserProfilePage() {
  const [savedProfile, setSavedProfile] = useState<PatientProfile>(defaultProfile);
  const [formData, setFormData] = useState<PatientProfile>(defaultProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timer = window.setTimeout(() => {
      setNotice("");
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [notice]);

  const fullName = useMemo(
    () => `${savedProfile.firstName} ${savedProfile.lastName}`,
    [savedProfile.firstName, savedProfile.lastName]
  );

  const onInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onStartEdit = () => {
    setNotice("");
    setFormData(savedProfile);
    setIsEditing(true);
  };

  const onCancel = () => {
    setFormData(savedProfile);
    setIsEditing(false);
    setNotice("ยกเลิกการแก้ไขแล้ว");
  };

  const onSave = () => {
    setSavedProfile(formData);
    setIsEditing(false);
    setNotice("บันทึกข้อมูลเรียบร้อย");
  };

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.header}>
          <div>
            <p className={styles.badge}>Patient Profile</p>
            <h1>ข้อมูลส่วนตัวผู้ป่วย</h1>
            <div className={styles.metaRow}>
              <p className={styles.subtitle}>ชื่อ: {fullName} | รหัสผู้ป่วย: {savedProfile.patientCode}</p>
              <div className={styles.noticeSlot}>
                <p className={`${styles.notice} ${notice ? "" : styles.noticeHidden}`}>{notice || " "}</p>
              </div>
            </div>
          </div>

          <div className={styles.actions}>
            {!isEditing ? (
              <button type="button" className={styles.editButton} onClick={onStartEdit}>
                แก้ไขข้อมูล
              </button>
            ) : (
              <>
                <button type="button" className={styles.cancelButton} onClick={onCancel}>
                  ยกเลิก
                </button>
                <button type="button" className={styles.saveButton} onClick={onSave}>
                  บันทึก
                </button>
              </>
            )}
          </div>
        </div>

        <div className={styles.formGrid}>
          <label>
            ชื่อ
            <input
              name="firstName"
              value={formData.firstName}
              onChange={onInputChange}
              disabled={!isEditing}
            />
          </label>

          <label>
            นามสกุล
            <input
              name="lastName"
              value={formData.lastName}
              onChange={onInputChange}
              disabled={!isEditing}
            />
          </label>

          <label>
            เบอร์โทรศัพท์
            <input name="phone" value={formData.phone} onChange={onInputChange} disabled={!isEditing} />
          </label>

          <label>
            อีเมล
            <input name="email" value={formData.email} onChange={onInputChange} disabled={!isEditing} />
          </label>

          <label>
            วันเกิด
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={onInputChange}
              disabled={!isEditing}
            />
          </label>

          <label>
            เพศ
            <select
              name="gender"
              value={formData.gender}
              onChange={onInputChange}
              disabled={!isEditing}
              className={!isEditing ? styles.selectReadonly : ""}
            >
              <option value="หญิง">หญิง</option>
              <option value="ชาย">ชาย</option>
            </select>
          </label>

          <label>
            หมู่เลือด
            <select
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={onInputChange}
              disabled={!isEditing}
              className={!isEditing ? styles.selectReadonly : ""}
            >
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="AB">AB</option>
              <option value="O">O</option>
            </select>
          </label>

          <label>
            โรคประจำตัว
            <input
              name="chronicDisease"
              value={formData.chronicDisease}
              onChange={onInputChange}
              disabled={!isEditing}
            />
          </label>

          <label className={styles.fullWidth}>
            ประวัติแพ้ยา
            <input
              name="allergies"
              value={formData.allergies}
              onChange={onInputChange}
              disabled={!isEditing}
            />
          </label>

          <label className={styles.fullWidth}>
            ผู้ติดต่อฉุกเฉิน
            <input
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={onInputChange}
              disabled={!isEditing}
            />
          </label>

          <label className={styles.fullWidth}>
            ที่อยู่
            <textarea
              name="address"
              value={formData.address}
              onChange={onInputChange}
              rows={3}
              disabled={!isEditing}
            />
          </label>
        </div>
      </section>
    </main>
  );
}
