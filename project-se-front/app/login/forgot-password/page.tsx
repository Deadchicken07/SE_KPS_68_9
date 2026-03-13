// "use client";

// import { CSSProperties, useState } from "react";
// import { useRouter } from "next/navigation";
// import { Alert, Button, Card, Flex, Input, Layout, notification, Steps, Typography } from "antd";
// import axios from "axios";
// import OtpInput from "@/components/OtpInput";
// import { useOtpVerification } from "@/hooks/useOtpVerification";

// import { buttonStyle, cardStyle, inputStyle, labelStyle, orbBaseStyle, shellStyle } from "@/style/forgot-password.styles";

// export default function ForgotPasswordPage() {
//   const router = useRouter();
//   const {
//     sendOtp,
//     verifyOtp,
//     sendOtpLoading,
//     verifyOtpLoading,
//     cooldown,
//     error: otpError,
//   } = useOtpVerification();

//   const [step, setStep] = useState<1 | 2 | 3>(1);
//   const [email, setEmail] = useState("");
//   const [otp, setOtp] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [successMessage, setSuccessMessage] = useState<string | null>(null);
//   const [api, contextHolder] = notification.useNotification();
//   const handleSendOtp = async () => {
//     setError(null);
//     if (!email.trim()) {
//       setError("กรุณากรอกอีเมล");
//       return;
//     }

//     const ok = await sendOtp(email);
//     if (ok) setStep(2);
//   };

//   const handleVerifyOtp = async () => {
//     setError(null);
//     if (otp.length !== 6) {
//       setError("กรุณากรอก OTP 6 หลัก");
//       return;
//     }

//     const ok = await verifyOtp(email, otp);
//     if (ok) setStep(3);
//   };

//   const handleResetPassword = async () => {
//     setError(null);

//     if (!newPassword) {
//       setError("กรุณากรอกรหัสผ่านใหม่");
//       return;
//     }

//     if (newPassword.length < 6) {
//       setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
//       return;
//     }

//     if (newPassword !== confirmPassword) {
//       setError("รหัสผ่านไม่ตรงกัน");
//       return;
//     }

//     try {
//       setLoading(true);
//       await axios.post("http://localhost:4000/auth/reset-password", {
//         email,
//         newPassword,
//       });

//       setSuccessMessage("เปลี่ยนรหัสผ่านสำเร็จ");
//       setTimeout(() => router.push("/login"), 1200);
//     } catch (err: unknown) {
//       const message =
//         (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
//         "ไม่สามารถเปลี่ยนรหัสผ่านได้";
//       setError(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//      <>
//      {contextHolder}
//     <Layout style={shellStyle}>
//       <div
//         style={{
//           ...orbBaseStyle,
//           top: -120,
//           left: -120,
//           width: 260,
//           height: 260,
//           background: "rgba(14, 91, 80, 0.20)",
//         }}
//       />
//       <div
//         style={{
//           ...orbBaseStyle,
//           right: -120,
//           bottom: -140,
//           width: 320,
//           height: 320,
//           background: "rgba(192, 144, 87, 0.20)",
//         }}
//       />

//       <Flex align="center" justify="center" style={{ minHeight: "100%" }}>
//         <Card variant="borderless" styles={{ body: { padding: 40 } }} style={cardStyle}>
//           <Typography.Text
//             style={{
//               fontSize: 12,
//               fontWeight: 500,
//               textTransform: "uppercase",
//               letterSpacing: "0.16em",
//               color: "rgba(14, 91, 80, 0.75)",
//             }}
//           >
//             Account recovery
//           </Typography.Text>

//           <Typography.Title level={2} style={{ marginTop: 8, marginBottom: 0, color: "#0f172a" }}>
//             ลืมรหัสผ่าน
//           </Typography.Title>

//           <Steps
//             current={step - 1}
//             items={[{ title: "Email" }, { title: "OTP" }, { title: "Password" }]}
//             responsive
//             style={{ marginTop: 20 }}
//           />

//           {step === 1 && (
//             <Flex vertical gap={16} style={{ marginTop: 24 }}>
//               <Typography.Text style={labelStyle}>อีเมล</Typography.Text>
//               <Input
//                 size="large"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 placeholder="example@email.com"
//                 style={inputStyle}
//               />
//               <Button
//                 type="primary"
//                 size="large"
//                 onClick={handleSendOtp}
//                 loading={sendOtpLoading}
//                 style={buttonStyle}
//               >
//                 {sendOtpLoading ? "กำลังส่ง OTP..." : "ส่ง OTP"}
//               </Button>
//             </Flex>
//           )}

//           {step === 2 && (
//             <Flex vertical gap={20} align="center" style={{ marginTop: 24, textAlign: "center" }}>
//               <Typography.Text style={{ color: "#475569", fontSize: 14 }}>
//                 กรอกรหัส OTP ที่ส่งไปยัง
//                 <br />
//                 <span style={{ fontWeight: 500, color: "#1e293b" }}>{email}</span>
//               </Typography.Text>

//               <OtpInput value={otp} onChange={setOtp} />

//               <Button
//                 type="primary"
//                 size="large"
//                 onClick={handleVerifyOtp}
//                 disabled={otp.length !== 6}
//                 loading={verifyOtpLoading}
//                 style={buttonStyle}
//               >
//                 {verifyOtpLoading ? "กำลังตรวจสอบ..." : "ยืนยัน OTP"}
//               </Button>

//               <Typography.Link
//                 onClick={async () => {
//                   if (cooldown === 0 && !sendOtpLoading) {
//                     await sendOtp(email);
//                     setOtp("");
//                   }
//                 }}
//                 disabled={cooldown > 0}
//                 style={{
//                   fontSize: 14,
//                   color: cooldown > 0 ? "#94a3b8" : "#0e5b50",
//                 }}
//               >
//                 {cooldown > 0
//                   ? `ขอ OTP ใหม่ใน ${cooldown}s`
//                   : sendOtpLoading
//                     ? "กำลังส่ง OTP..."
//                     : "ขอ OTP ใหม่"}
//               </Typography.Link>
//             </Flex>
//           )}

//           {step === 3 && (
//             <Flex vertical gap={16} style={{ marginTop: 24 }}>
//               <div>
//                 <Typography.Text style={labelStyle}>รหัสผ่านใหม่</Typography.Text>
//                 <Input.Password
//                   size="large"
//                   value={newPassword}
//                   onChange={(e) => setNewPassword(e.target.value)}
//                   style={{ ...inputStyle, marginTop: 8 }}
//                 />
//               </div>

//               <div>
//                 <Typography.Text style={labelStyle}>ยืนยันรหัสผ่านใหม่</Typography.Text>
//                 <Input.Password
//                   size="large"
//                   value={confirmPassword}
//                   onChange={(e) => setConfirmPassword(e.target.value)}
//                   style={{ ...inputStyle, marginTop: 8 }}
//                 />
//               </div>

//               <Button
//                 type="primary"
//                 size="large"
//                 onClick={handleResetPassword}
//                 loading={loading}
//                 style={buttonStyle}
//               >
//                 {loading ? "กำลังบันทึก..." : "เปลี่ยนรหัสผ่าน"}
//               </Button>
//             </Flex>
//           )}

//           {(error || otpError) && (
//             <Alert style={{ marginTop: 20 }} type="error" title={error || otpError} showIcon />
//           )}
//           {successMessage && (
//             <Alert style={{ marginTop: 20 }} type="success" title={successMessage} showIcon />
//           )}

//           <Flex justify="center" style={{ marginTop: 24 }}>
//             <Typography.Link
//               onClick={() => router.push("/login")}
//               style={{ color: "#0e5b50", fontSize: 14, fontWeight: 500 }}
//             >
//               กลับไปหน้าเข้าสู่ระบบ
//             </Typography.Link>
//           </Flex>
//         </Card>
//       </Flex>
//     </Layout>
//     </>
//   );
  
// }
