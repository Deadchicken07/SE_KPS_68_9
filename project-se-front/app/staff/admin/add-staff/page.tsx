"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { notification, Spin, Upload, Button } from "antd";
import { UploadOutlined, PlusOutlined } from "@ant-design/icons";
import styles from "./page.module.css";
import { isSupabaseConfigured, supabase } from "@/utils/supabase";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AddStaffPage() {
  const router = useRouter();
  const [api, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    name: "",
    surName: "",
    password: "",
    roleId: 4, // Default to Psychiatrist (Role ID 4)
    phone: "",
    info: "",
    degree: "",
    license: "",
    fileName: "",
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "roleId" ? parseInt(value) : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = "";

      // 1. Upload image to Supabase if exists
      if (profileImage) {
        if (!isSupabaseConfigured || !supabase) {
          throw new Error("Supabase is not configured");
        }

        const fileExt = profileImage.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('Paid_appointment') // Reuse existing bucket or use a specific one if known
          .upload(filePath, profileImage);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw new Error('ไม่สามารถอัปโหลดรูปภาพโปรไฟล์ได้');
        }

        const { data: { publicUrl } } = supabase.storage
          .from('Paid_appointment')
          .getPublicUrl(filePath);
        
        imageUrl = publicUrl;
      }

      await axios.post(`${API}/users/staff`, { ...form, fileName: imageUrl }, {
        withCredentials: true,
      });

      api.success({
        message: "เพิ่มบุคลากรสำเร็จ",
        description: `เพิ่ม ${form.name} ${form.surName} เข้าสู่ระบบเรียบร้อยแล้ว`,
        placement: "topRight",
      });

      // Clear form or redirect
      setTimeout(() => {
        router.push("/staff/admin"); // Adjust path as needed
      }, 2000);
    } catch (error: any) {
      api.error({
        message: "เกิดข้อผิดพลาด",
        description: error.response?.data?.message || "ไม่สามารถเพิ่มข้อมูลบุคลากรได้",
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {contextHolder}
      <div className={styles.glassCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>เพิ่มบุคลากรใหม่</h1>
          <p className={styles.subtitle}>กรอกข้อมูลเพื่อสร้างบัญชีสำหรับ จิตแพทย์ นักจิตวิทยา หรือ เภสัชกร</p>
        </div>

        <div className={styles.profileUploadSection}>
          <div className={styles.avatarPreviewContainer}>
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className={styles.avatarPreview} />
            ) : (
              <div className={styles.avatarPlaceholder}>
                <PlusOutlined style={{ fontSize: 24, color: "#999" }} />
              </div>
            )}
          </div>
          <div className={styles.uploadControls}>
            <label className={styles.uploadLabel}>
              รูปภาพโปรไฟล์
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className={styles.fileInput}
              />
            </label>
            <p className={styles.uploadHint}>รองรับไฟล์ JPG, PNG (ขนาดไม่ควรเกิน 2MB)</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>ชื่อ</label>
            <input
              type="text"
              name="name"
              required
              className={styles.input}
              placeholder="กรอกชื่อ"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>นามสกุล</label>
            <input
              type="text"
              name="surName"
              required
              className={styles.input}
              placeholder="กรอกนามสกุล"
              value={form.surName}
              onChange={handleChange}
            />
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className={styles.label}>อีเมล</label>
            <input
              type="email"
              name="email"
              required
              className={styles.input}
              placeholder="example@jitdee.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>รหัสผ่าน</label>
            <input
              type="password"
              name="password"
              required
              className={styles.input}
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>บทบาท (Role)</label>
            <select
              name="roleId"
              className={`${styles.input} ${styles.select}`}
              value={form.roleId}
              onChange={handleChange}
            >
              <option value={4}>จิตแพทย์</option>
              <option value={3}>นักจิตวิทยา</option>
              <option value={5}>เภสัชกร</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>เบอร์โทรศัพท์</label>
            <input
              type="tel"
              name="phone"
              className={styles.input}
              placeholder="08X-XXX-XXXX"
              value={form.phone}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>เลขใบอนุญาตประกอบวิชาชีพ</label>
            <input
              type="text"
              name="license"
              className={styles.input}
              placeholder="เลขที่ใบอนุญาต"
              value={form.license}
              onChange={handleChange}
            />
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className={styles.label}>วุฒิการศึกษา</label>
            <input
              type="text"
              name="degree"
              className={styles.input}
              placeholder="เช่น พ.บ. (เกียรตินิยม), วว. จิตเวชศาสตร์"
              value={form.degree}
              onChange={handleChange}
            />
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className={styles.label}>ความเชี่ยวชาญ / ข้อมูลเพิ่มเติม</label>
            <textarea
              name="info"
              rows={3}
              className={styles.input}
              placeholder="ระบุความเชี่ยวชาญเฉพาะทาง..."
              value={form.info}
              onChange={handleChange}
              style={{ resize: "vertical", minHeight: "100px" }}
            />
          </div>

          <div className={`${styles.buttonContainer} ${styles.fullWidth}`}>
            <button
              type="button"
              className={styles.backBtn}
              onClick={() => router.back()}
              disabled={loading}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? <Spin size="small" /> : "บันทึกข้อมูล"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
