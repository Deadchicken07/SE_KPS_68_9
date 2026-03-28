"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Button,
  Card,
  Col,
  Flex,
  Form,
  Input,
  Layout,
  Row,
  Typography,
  notification,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useLogin } from "@/hooks/useLogin";

const getRedirectPathByRoleId = (roleId: number | null) => {
  switch (roleId) {
    case 1:
      return "/staff/admin/admin-home";
    case 2:
      return "/user";
    case 3:
      return "/staff/patient-history";
    case 4:
      return "/staff/patient-history";
    case 5:
      return "/staff/pharmacist/pharmacist_home";
    default:
      return "/user";
  }
};

export default function LoginPage() {
  const [api, contextHolder] = notification.useNotification();
  const { login, loading, error } = useLogin();
  const [form] = Form.useForm();
  const emailValue = Form.useWatch("email", form);
  const passwordValue = Form.useWatch("password", form);
  const router = useRouter();
  const [registered, setRegistered] = useState<string | null>(null);
  const [expired, setExpired] = useState<string | null>(null);
  const [redirectTarget, setRedirectTarget] = useState<string | null>(null);
  const isLoginDisabled = !emailValue?.trim() || !passwordValue?.trim();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setRegistered(searchParams.get("registered"));
    setExpired(searchParams.get("expired"));
    setRedirectTarget(searchParams.get("redirect"));
  }, []);

  useEffect(() => {
    if (registered === "success") {
      api.success({
        title: "สมัครสมาชิกสำเร็จ",
        description: "กรุณาเข้าสู่ระบบ",
        duration: 4,
      });
      router.replace("/login");
    }
  }, [registered, api, router]);

  const handleFinish = async (values: { email: string; password: string }) => {
    try {
      const me = await login(values.email, values.password);
      router.push(redirectTarget || getRedirectPathByRoleId(me.role_id));
    } catch {
      // handled by hook
    }
  };

  return (
    <>
      {contextHolder}

      <Layout
        className="auth-shell"
        style={{
          minHeight: "100dvh",
          padding: "32px 16px",
          boxSizing: "border-box",
          background:
            "radial-gradient(circle at 15% 20%, rgba(14, 91, 80, 0.16), transparent 46%), radial-gradient(circle at 85% 78%, rgba(192, 144, 87, 0.14), transparent 46%), linear-gradient(135deg, #f8f3ed 0%, #efe6da 52%, #e8dccd 100%)",
        }}
      >
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push("/user")}
          style={{
            position: "absolute",
            top: 18,
            left: 18,
            zIndex: 3,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            height: 40,
            paddingInline: 14,
            borderRadius: 999,
            background: "rgba(255,255,255,0.74)",
            color: "#0f766e",
            boxShadow: "0 12px 30px rgba(15, 118, 110, 0.12)",
          }}
        >
          กลับหน้าหลัก
        </Button>
        <div
          className="auth-orb"
          style={{
            top: -140,
            left: -120,
            width: 280,
            height: 280,
            background: "rgba(14, 91, 80, 0.20)",
          }}
        />
        <div
          className="auth-orb"
          style={{
            right: -120,
            bottom: -170,
            width: 320,
            height: 320,
            background: "rgba(192, 144, 87, 0.20)",
          }}
        />

        <Flex
          align="center"
          justify="center"
          style={{ minHeight: "calc(100dvh - 64px)" }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 1320,
              overflow: "hidden",
              borderRadius: 34,
              background: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(14px)",
              boxShadow: "0 45px 120px rgba(25, 56, 48, 0.24)",
            }}
          >
            <Row gutter={0} wrap>
              <Col xs={0} lg={14}>
                <div
                  className="auth-panel-premium"
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    minHeight: 740,
                    padding: 48,
                    color: "#ffffff",
                    background: "#155f54",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      borderRadius: "9999px",
                      background: "rgba(255,255,255,0.12)",
                      filter: "blur(48px)",
                      top: 48,
                      right: -64,
                      width: 208,
                      height: 208,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      borderRadius: "9999px",
                      background: "rgba(255,255,255,0.12)",
                      filter: "blur(48px)",
                      left: -32,
                      bottom: -64,
                      width: 288,
                      height: 288,
                    }}
                  />

                  <Flex vertical justify="space-between" style={{ position: "relative", zIndex: 1, minHeight: 644 }}>
                    <div>
                      <Typography.Text
                        style={{
                          display: "inline-flex",
                          padding: "6px 16px",
                          borderRadius: 9999,
                          background: "rgba(255,255,255,0.10)",
                          fontSize: 12,
                          letterSpacing: "0.18em",
                          color: "rgba(255,255,255,0.9)",
                        }}
                      >
                        MENTALCARE PLATFORM
                      </Typography.Text>

                      <Typography.Title
                        level={1}
                        style={{
                          marginTop: 32,
                          marginBottom: 0,
                          color: "#ffffff",
                          fontSize: 64,
                          lineHeight: 1.08,
                        }}
                      >
                        JITDEE
                      </Typography.Title>

                      <Typography.Paragraph
                        style={{
                          marginTop: 28,
                          marginBottom: 0,
                          maxWidth: 520,
                          color: "rgba(255,255,255,0.88)",
                          fontSize: 18,
                          lineHeight: 1.8,
                        }}
                      >
                        ระบบให้คำปรึกษาออนไลน์ที่ออกแบบเพื่อความปลอดภัยความเป็นส่วนตัว
                      </Typography.Paragraph>
                    </div>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Card
                          variant="borderless"
                          styles={{ body: { padding: 16 } }}
                          style={{ borderRadius: 20, background: "rgba(255,255,255,0.10)", color: "#fff" }}
                        >
                          <Typography.Title level={3} style={{ margin: 0, color: "#fff" }}>
                            24/7
                          </Typography.Title>
                          <Typography.Text style={{ color: "rgba(255,255,255,0.8)" }}>
                            ดูแลต่อเนื่อง
                          </Typography.Text>
                        </Card>
                      </Col>
                      <Col span={12}>
                        <Card
                          variant="borderless"
                          styles={{ body: { padding: 16 } }}
                          style={{ borderRadius: 20, background: "rgba(255,255,255,0.10)", color: "#fff" }}
                        >
                          <Typography.Title level={3} style={{ margin: 0, color: "#fff" }}>
                            AES
                          </Typography.Title>
                          <Typography.Text style={{ color: "rgba(255,255,255,0.8)" }}>
                            ข้อมูลปลอดภัย
                          </Typography.Text>
                        </Card>
                      </Col>
                    </Row>
                  </Flex>
                </div>
              </Col>

              <Col xs={24} lg={10}>
                <Flex
                  align="center"
                  justify="center"
                  style={{
                    minHeight: 740,
                    padding: 24,
                  }}
                >
                  <Card
                    variant="borderless"
                    className="auth-card"
                    styles={{ body: { padding: 40 } }}
                    style={{ width: "100%", maxWidth: 460 }}
                  >
                    <Typography.Title
                      level={2}
                      style={{ marginTop: 12, marginBottom: 0, color: "#0f172a", fontSize: 32 }}
                    >
                      เข้าสู่ระบบ
                    </Typography.Title>

                    {expired === "1" ? (
                      <Alert
                        type="warning"
                        showIcon
                        title="session หมดอายุ กรุณาเข้าสู่ระบบใหม่"
                        style={{ marginTop: 20, marginBottom: 0 }}
                      />
                    ) : null}

                    <Form
                      form={form}
                      layout="vertical"
                      onFinish={handleFinish}
                      requiredMark={false}
                      style={{ marginTop: 32 }}
                    >
                      <Form.Item
                        label={<span style={{ fontSize: 14, fontWeight: 500, color: "#475569" }}>อีเมล</span>}
                        name="email"
                        style={{ marginBottom: 20 }}
                      >
                        <Input placeholder="example@email.com" className="input" />
                      </Form.Item>

                      <Form.Item
                        label={<span style={{ fontSize: 14, fontWeight: 500, color: "#475569" }}>รหัสผ่าน</span>}
                        name="password"
                        style={{ marginBottom: 24 }}
                      >
                        <Input.Password placeholder="********" className="input" />
                      </Form.Item>

                      <Form.Item style={{ marginBottom: error ? 16 : 0 }}>
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={loading}
                          disabled={isLoginDisabled}
                          style={{ width: "100%", height: 52, border: "none", borderRadius: 12, fontWeight: 600 }}
                        >
                          {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                        </Button>
                      </Form.Item>

                      {error && <Alert type="error" title={error} showIcon style={{ marginBottom: 8 }} />}
                    </Form>

                    <Flex vertical gap={8} align="center" style={{ marginTop: 24 }}>
                      {/* <Typography.Link
                        onClick={() => router.push("/login/forgot-password")}
                        style={{ color: "#0e5b50", fontSize: 14, fontWeight: 500 }}
                      >
                        ลืมรหัสผ่าน?
                      </Typography.Link> */}

                      <Typography.Text style={{ color: "#475569", fontSize: 14 }}>
                        ยังไม่มีบัญชี?{" "}
                        <Typography.Link
                          onClick={() => router.push("/login/regis")}
                          style={{ color: "#0e5b50", fontWeight: 600 }}
                        >
                          สมัครสมาชิก
                        </Typography.Link>
                      </Typography.Text>
                    </Flex>
                  </Card>
                </Flex>
              </Col>
            </Row>
          </div>
        </Flex>
      </Layout>
    </>
  );
}
