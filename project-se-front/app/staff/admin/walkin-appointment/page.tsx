"use client";

import { useState, useEffect } from "react";
import { Form, Input, Select, DatePicker, Button, Card, Typography, message, Radio } from "antd";
import axios from "axios";
import { useStaff } from "@/hooks/useStaff";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";

const { Title } = Typography;
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function WalkinAppointmentPage() {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();
  const { staffs } = useStaff();

  const [loading, setLoading] = useState(false);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [fetchingPatients, setFetchingPatients] = useState(false);

  // Available slots mapping: { staffId: ["09:00", "09:30"] }
  const [availableSlotsMap, setAvailableSlotsMap] = useState<Record<number, string[]>>({});
  const [patients, setPatients] = useState<any[]>([]);

  // States for dynamic selections
  const [patientMode, setPatientMode] = useState<'existing' | 'new'>('existing');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(30);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setFetchingPatients(true);
        const res = await axios.get(`${API}/users?limit=1000&roleId=2`, {
          withCredentials: true,
        });
        setPatients(res.data.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setFetchingPatients(false);
      }
    };
    fetchPatients();
  }, []);

  const fetchAvailableSlots = async (dateStr: string) => {
    try {
      setFetchingSlots(true);
      const res = await axios.get(`${API}/appointments/available-slots?date=${dateStr}`, {
        withCredentials: true,
      });
      setAvailableSlotsMap(res.data);
    } catch (error) {
      console.error(error);
      messageApi.error("ไม่สามารถดึงข้อมูลเวลาว่างได้");
      setAvailableSlotsMap({});
    } finally {
      setFetchingSlots(false);
    }
  };

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    form.setFieldsValue({ startTime: undefined, staffId: undefined });
    setSelectedTime(null);

    if (date) {
      const dateStr = date.format("YYYY-MM-DD");
      setSelectedDate(dateStr);
      fetchAvailableSlots(dateStr);
    } else {
      setSelectedDate(null);
      setAvailableSlotsMap({});
    }
  };

  const handleTimeChange = (val: string) => {
    form.setFieldsValue({ staffId: undefined });
    setSelectedTime(val);
  };

  // Extract unique times from all staffs' available slots
  const allUniqueTimes = Array.from(
    new Set(Object.values(availableSlotsMap).flat())
  ).sort((a, b) => a.localeCompare(b));

  // Filter staff to those available at the selected time
  const availableStaffs = staffs.filter((staff: any) => {
    if (!selectedTime) return false;
    const sId = staff.id || staff.user_id;
    const staffSlots = availableSlotsMap[sId] || [];

    if (selectedDuration === 30) {
      return staffSlots.includes(selectedTime);
    } else if (selectedDuration === 60) {
      const [hh, mm] = selectedTime.split(":");
      const startDayjs = dayjs().hour(Number(hh)).minute(Number(mm));
      const nextSlot = startDayjs.add(30, "minute").format("HH:mm");
      return staffSlots.includes(selectedTime) && staffSlots.includes(nextSlot);
    }
    return false;
  });

  const onFinish = async (values: any) => {
    try {
      setLoading(true);

      const [hh, mm] = values.startTime.split(":");
      const startDayjs = dayjs().hour(Number(hh)).minute(Number(mm));
      const endDayjs = startDayjs.add(values.duration, "minute");
      const timeSelect = `${startDayjs.format("HH:mm")} - ${endDayjs.format("HH:mm")}`;

      let payload: any = {
        staffId: values.staffId,
        date: values.date.format("YYYY-MM-DD"),
        timeSelect,
        duration: values.duration,
        appointmentType: "onsite",
      };

      if (patientMode === 'new') {
        payload = {
          ...payload,
          name: values.name,
          surname: values.surname,
          phone: values.phone,
          nationId: values.nationId,
          medicalCondition: values.medicalCondition,
          allergyDrug: values.allergyDrug,
          nationAddress: values.nationAddress,
          currentAddress: values.currentAddress,
        }
      } else {
        payload.userId = values.userId;
      }

      const res = await axios.post(`${API}/appointments/admin`, payload, {
        withCredentials: true,
      });

      message.success("เพิ่มการนัดหมายสำเร็จ");
      const appointmentId = res.data.appointmentId;
      if (appointmentId) {
        router.push(`/staff/admin/payment?appointmentId=${appointmentId}`);
      } else {
        form.resetFields();
        setSelectedDate(null);
        setSelectedTime(null);
        messageApi.success("เพิ่มนัดหมาย Walk-in สำเร็จ!");
        setAvailableSlotsMap({});
      }
    } catch (error: any) {
      console.error(error);
      messageApi.error(error.response?.data?.message || "ไม่สามารถเพิ่มการนัดหมายได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        padding: 24,
        background:
          "radial-gradient(circle at top left, rgba(63, 127, 109, 0.14), transparent 34%), radial-gradient(circle at bottom right, rgba(192, 144, 87, 0.12), transparent 28%), linear-gradient(180deg, #f7f1ea 0%, #f3ede4 100%)",
        minHeight: "100vh",
      }}
    >
      {contextHolder}
      <Card style={{ width: "100%", maxWidth: 650, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", borderRadius: 12, padding: 12 }}>
        <Title level={3} style={{ textAlign: "center", marginBottom: 24, color: "#0f766e" }}>
          จองคิวผู้ป่วย Walk-in
        </Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ duration: 30 }}
        >
          <div style={{ marginBottom: 24, textAlign: 'center' }}>
            <Radio.Group
              value={patientMode}
              onChange={(e) => {
                form.setFieldsValue({ userId: undefined, name: undefined, surname: undefined });
                setPatientMode(e.target.value);
              }}
              buttonStyle="solid"
              size="large"
            >
              <Radio.Button value="existing">เลือกประวัติเดิมที่มีในระบบ</Radio.Button>
              <Radio.Button value="new">เพิ่มประวัติผู้ป่วยใหม่</Radio.Button>
            </Radio.Group>
          </div>

          <div style={{ background: '#f9fafb', padding: 20, borderRadius: 12, border: '1px solid #e5e7eb', marginBottom: 24 }}>
            <Title level={5} style={{ marginTop: 0, color: '#1f2937' }}>ข้อมูลผู้ป่วย</Title>

            {patientMode === 'existing' && (
              <Form.Item
                name="userId"
                label="ค้นหารายชื่อผู้ป่วยจากระบบ"
                rules={[{ required: true, message: "กรุณาเลือกผู้ป่วย" }]}
              >
                <Select
                  showSearch
                  size="large"
                  loading={fetchingPatients}
                  placeholder="พิมพ์ชื่อเพื่อค้นหาผู้ป่วย"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    String(option?.children ?? "").toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {patients.map(p => (
                    <Select.Option key={p.userId} value={p.userId}>
                      {p.name} {p.email ? `(${p.email})` : ''} - [ID: {p.userId}]
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            {patientMode === 'new' && (
              <>
                <div style={{ display: "flex", gap: 16 }}>
                  <Form.Item
                    name="name"
                    label="ชื่อจริง (Name)"
                    style={{ flex: 1 }}
                    rules={[{ required: true, message: "กรุณาระบุชื่อ" }]}
                  >
                    <Input placeholder="เช่น สมชาย" />
                  </Form.Item>

                  <Form.Item
                    name="surname"
                    label="นามสกุล (Surname)"
                    style={{ flex: 1 }}
                    rules={[{ required: true, message: "กรุณาระบุนามสกุล" }]}
                  >
                    <Input placeholder="เช่น ใจดี" />
                  </Form.Item>
                </div>

                <div style={{ display: "flex", gap: 16 }}>
                  <Form.Item
                    name="nationId"
                    label="เลขบัตรประจำตัวประชาชน"
                    style={{ flex: 1 }}
                    rules={[
                      { required: true, message: "กรุณาระบุเลขประจำตัวประชาชน" },
                      { len: 13, message: "เลขบัตรประชาชนต้องมี 13 หลัก" }
                    ]}
                  >
                    <Input placeholder="เลขบัตร 13 หลัก" maxLength={13} />
                  </Form.Item>
                  <Form.Item
                    name="phone"
                    label="เบอร์โทรศัพท์"
                    style={{ flex: 1 }}
                  >
                    <Input placeholder="เช่น 0812345678" />
                  </Form.Item>
                </div>

                <div style={{ display: "flex", gap: 16 }}>
                  <Form.Item
                    name="medicalCondition"
                    label="โรคประจำตัว"
                    style={{ flex: 1 }}
                  >
                    <Input placeholder="กรณีไม่มีโรคประจำตัว ปล่อยว่างไว้" />
                  </Form.Item>

                  <Form.Item
                    name="allergyDrug"
                    label="ประวัติแพ้ยา"
                    style={{ flex: 1 }}
                  >
                    <Input placeholder="กรณีไม่มีประวัติ ปล่อยว่างไว้" />
                  </Form.Item>
                </div>

                <Form.Item
                  name="nationAddress"
                  label="ที่อยู่ตามทะเบียนบ้าน"
                >
                  <Input.TextArea placeholder="รายละเอียดที่อยู่อย่างครบถ้วน" rows={2} />
                </Form.Item>

                <Form.Item
                  name="currentAddress"
                  label="ที่อยู่ปัจจุบัน (ไม่บังคับ)"
                >
                  <Input.TextArea placeholder="รายละเอียดที่อยู่อย่างครบถ้วน (หรือเขียนว่า ตรงกับทะเบียนบ้าน)" rows={2} />
                </Form.Item>
              </>
            )}
          </div>

          <div style={{ background: '#f9fafb', padding: 20, borderRadius: 12, border: '1px solid #e5e7eb', marginBottom: 24 }}>
            <Title level={5} style={{ marginTop: 0, color: '#1f2937' }}>ข้อมูลการนัดหมาย</Title>
            <Form.Item
              name="date"
              label="วันที่เข้าพบ"
              rules={[{ required: true, message: "กรุณาเลือกวันที่" }]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="YYYY-MM-DD"
                size="large"
                onChange={handleDateChange}
                disabledDate={(current) => current && current < dayjs().startOf('day')}
              />
            </Form.Item>

            <Form.Item
              name="startTime"
              label="เวลาเริ่ม (Start Time)"
              rules={[{ required: true, message: "กรุณาเลือกเวลาเริ่ม" }]}
            >
              <Select
                placeholder={selectedDate ? "เลือกเวลา" : "กรุณาเลือกวันที่ก่อนเพื่อดูคิว"}
                disabled={!selectedDate}
                loading={fetchingSlots}
                size="large"
                onChange={handleTimeChange}
              >
                {allUniqueTimes.map((time) => (
                  <Select.Option key={time} value={time}>
                    {time} น.
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <div style={{ display: "flex", gap: 16 }}>
              <Form.Item
                name="duration"
                label="ระยะเวลา (Duration)"
                style={{ flex: 1 }}
                rules={[{ required: true, message: "กรุณาเลือกระยะเวลา" }]}
              >
                <Select size="large" onChange={(val) => {
                  form.setFieldsValue({ staffId: undefined });
                  setSelectedDuration(val);
                }}>
                  <Select.Option value={30}>30 นาที</Select.Option>
                  <Select.Option value={60}>1 ชั่วโมง</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="staffId"
                label="แพทย์/ผู้ให้คำปรึกษา"
                style={{ flex: 1 }}
                rules={[{ required: true, message: "กรุณาเลือกแพทย์/ผู้ให้คำปรึกษา" }]}
              >
                <Select
                  size="large"
                  placeholder={selectedTime ? "เลือกแพทย์ที่ว่าง" : "เลือกเวลาก่อน"}
                  disabled={!selectedTime}
                >
                  {availableStaffs.map((staff: any) => {
                    const idItem = staff.id || staff.user_id;
                    return (
                      <Select.Option key={idItem} value={idItem}>
                        {staff.name} {staff.sur_name || ""}
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </div>
          </div>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
              style={{ backgroundColor: "#0f766e", height: 52, fontSize: 16, fontWeight: 'bold', borderRadius: 8 }}
            >
              ยืนยันการเพิ่มคิวนัดหมาย Walk-in
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
