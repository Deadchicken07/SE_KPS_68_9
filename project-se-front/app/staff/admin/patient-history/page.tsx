"use client";

import { useEffect, useMemo, useState } from "react";
import { message } from "antd";
import PageSkeleton from "@/components/ui/PageSkeleton";
import styles from "./page.module.css";
import { usePharmacistPatientHistory } from "@/hooks/usePharmacistPatientHistory";

const formatDateTime = (value: string) => {
  const date = new Date(value);
  const formattedDate = date.toLocaleDateString("th-TH", { dateStyle: "medium" });
  const formattedTime = date.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${formattedDate} | ${formattedTime}`;
};

export default function PatientHistoryPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const {
    patients,
    isLoading,
    isFetching,
    search,
    setSearch,
    selectedPatient,
    selectedPatientId,
    setSelectedPatientId,
    fetchPatients,
  } = usePharmacistPatientHistory();

  const latestRecord = useMemo(() => {
    if (!selectedPatient || selectedPatient.records.length === 0) {
      return null;
    }

    return selectedPatient.records[0];
  }, [selectedPatient]);

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

  const handleSearch = async () => {
    const result = await fetchPatients();
    if (!result.ok) {
      messageApi.error(result.message);
    }
  };

  if (isLoading) {
    return <PageSkeleton cards={[{ rows: 4 }, { rows: 8 }]} />;
  }

  return (
    <main className={styles.page}>
      {contextHolder}

      <section className={styles.hero}>
        <h1>ประวัติผู้ป่วย</h1>
        <p>
          {selectedPatient
            ? `ข้อมูลนี้แสดงเฉพาะประวัติของ ${selectedPatient.patientName}`
            : "เลือกผู้ป่วยเพื่อดูประวัติจากข้อมูลจริงในระบบ"}
        </p>

        <div className={styles.controlsPanel}>
          <div className={styles.controlGroup}>
            <label htmlFor="patient-search">ค้นหาผู้ป่วย</label>
            <input
              id="patient-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void handleSearch();
                }
              }}
              placeholder="ชื่อหรือเบอร์โทร"
            />
          </div>

          <div className={styles.controlGroup}>
            <label htmlFor="patient-select">เลือกผู้ป่วย</label>
            <select
              id="patient-select"
              value={selectedPatientId ?? ""}
              onChange={(event) => setSelectedPatientId(Number(event.target.value))}
              disabled={isFetching || patients.length === 0}
            >
              {patients.length === 0 ? (
                <option value="">ไม่พบข้อมูลผู้ป่วย</option>
              ) : (
                patients.map((patient) => (
                  <option key={patient.patientId} value={patient.patientId}>
                    {patient.patientName}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </section>

      <section className={styles.contentSection}>
        {!selectedPatient ? (
          <article className={styles.infoCard}>
            <p className={styles.emptyText}>ยังไม่มีข้อมูลประวัติผู้ป่วย</p>
          </article>
        ) : (
          <>
            <article className={styles.infoCard}>
              <h2>ข้อมูลส่วนตัว</h2>
              <div className={styles.grid}>
                <div className={styles.field}>
                  <span>ชื่อ-นามสกุล</span>
                  <strong>{selectedPatient.patientName}</strong>
                </div>
                <div className={styles.field}>
                  <span>รหัสผู้ป่วย</span>
                  <strong>{selectedPatient.patientId}</strong>
                </div>
                <div className={styles.field}>
                  <span>เบอร์โทร</span>
                  <strong>{selectedPatient.phone || "-"}</strong>
                </div>
                <div className={styles.field}>
                  <span>จำนวนประวัติ</span>
                  <strong>{selectedPatient.recordCount}</strong>
                </div>
              </div>
            </article>

            <article className={styles.infoCard}>
              <h2>ข้อมูลสุขภาพพื้นฐาน</h2>
              <div className={styles.grid}>
                <div className={styles.field}>
                  <span>โรคประจำตัว</span>
                  <strong>{selectedPatient.medicalCondition || "-"}</strong>
                </div>
                <div className={styles.field}>
                  <span>ประวัติแพ้ยา</span>
                  <strong>{selectedPatient.allergyDrug || "-"}</strong>
                </div>
                <div className={styles.field}>
                  <span>วันที่พบล่าสุด</span>
                  <strong>
                    {selectedPatient.latestConsultedAt
                      ? formatDateTime(selectedPatient.latestConsultedAt)
                      : "-"}
                  </strong>
                </div>
                <div className={styles.field}>
                  <span>หมายเหตุล่าสุด</span>
                  <strong>{selectedPatient.latestNote || "-"}</strong>
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
                    <span>วันเวลาบันทึกล่าสุด</span>
                    <strong>{latestRecord.createdAt ? formatDateTime(latestRecord.createdAt) : "-"}</strong>
                  </div>
                  <div className={styles.field}>
                    <span>รหัส consultation</span>
                    <strong>#{latestRecord.consultationId}</strong>
                  </div>
                  <div className={`${styles.field} ${styles.full}`}>
                    <span>หมายเหตุ</span>
                    <strong>{latestRecord.note || "-"}</strong>
                  </div>
                </div>
              )}
            </article>

            {selectedPatient.records.map((record) => (
              <article className={styles.infoCard} key={record.consultationId}>
                <h2>ประวัติ Consultation #{record.consultationId}</h2>
                <div className={styles.grid}>
                  <div className={styles.field}>
                    <span>วันที่บันทึก</span>
                    <strong>{record.createdAt ? formatDateTime(record.createdAt) : "-"}</strong>
                  </div>
                  <div className={styles.field}>
                    <span>เภสัชกร</span>
                    <strong>{record.pharmacistName}</strong>
                  </div>
                  <div className={`${styles.field} ${styles.full}`}>
                    <span>รายการยา</span>
                    <strong>
                      {record.medicines.length === 0
                        ? "-"
                        : record.medicines
                            .map((medicine) =>
                              `${medicine.name} x ${medicine.quantity}${medicine.comment ? ` (${medicine.comment})` : ""}`,
                            )
                            .join(", ")}
                    </strong>
                  </div>
                  <div className={`${styles.field} ${styles.full}`}>
                    <span>ใบเสร็จ / Tracking</span>
                    <strong>
                      {record.receipts.length === 0
                        ? "-"
                        : record.receipts
                            .map(
                              (receipt) =>
                                `#${receipt.receiptId} ${receipt.status || "-"} ${receipt.tracking || "-"}`,
                            )
                            .join(", ")}
                    </strong>
                  </div>
                  <div className={`${styles.field} ${styles.full}`}>
                    <span>หมายเหตุ</span>
                    <strong>{record.note || "-"}</strong>
                  </div>
                </div>
              </article>
            ))}
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
