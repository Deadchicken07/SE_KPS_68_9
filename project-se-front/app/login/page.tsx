"use client";

import { CSSProperties, useEffect, useState } from "react";
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
import { useLogin } from "@/hooks/useLogin";
import { formLabelStyle, inputStyle, loginCardStyle, orbBaseStyle, outerPanelStyle, premiumGlowStyle, premiumPanelStyle, primaryButtonStyle, shellStyle } from "@/style/login.styles";

export default function LoginPage() {
  const [api, contextHolder] = notification.useNotification();
  const { login, loading, error } = useLogin();
  const [form] = Form.useForm();
  const router = useRouter();
  const [registered, setRegistered] = useState<string | null>(null);

  useEffect(() => {
    setRegistered(new URLSearchParams(window.location.search).get("registered"));
  }, []);

  useEffect(() => {
    if (registered === "success") {
      api.success({
        message: "สมัครสมาชิกสำเร็จ",
        description: "กรุณาเข้าสู่ระบบ",
        duration: 4,
      });
      router.replace("/login");
    }
  }, [registered, api, router]);

  const handleFinish = async (values: { email: string; password: string }) => {
    try {
      await login(values.email, values.password);
      router.push("/user");
    } catch {
      // handled by hook
    }
  };

  return (
    <>
      {contextHolder}

      <Layout style={shellStyle}>
        <div
          style={{
            ...orbBaseStyle,
            top: -140,
            left: -120,
            width: 280,
            height: 280,
            background: "rgba(14, 91, 80, 0.20)",
          }}
        />
        <div
          style={{
            ...orbBaseStyle,
            right: -120,
            bottom: -170,
            width: 320,
            height: 320,
            background: "rgba(192, 144, 87, 0.20)",
          }}
        />

        <Flex align="center" justify="center" style={{ minHeight: "100%" }}>
          <div style={outerPanelStyle}>
            <Row gutter={0} wrap>
              <Col xs={0} lg={14}>
                <div style={premiumPanelStyle}>
                  <div style={{ ...premiumGlowStyle, top: 48, right: -64, width: 208, height: 208 }} />
                  <div
                    style={{ ...premiumGlowStyle, left: -32, bottom: -64, width: 288, height: 288 }}
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
                        ระบบให้คำปรึกษาออนไลน์ที่ออกแบบเพื่อความปลอดภัย ความเป็นส่วนตัว
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
                    styles={{ body: { padding: 40 } }}
                    style={loginCardStyle}
                  >
                    <Typography.Title
                      level={2}
                      style={{ marginTop: 12, marginBottom: 0, color: "#0f172a", fontSize: 32 }}
                    >
                      เข้าสู่ระบบ
                    </Typography.Title>

                    <Form
                      form={form}
                      layout="vertical"
                      onFinish={handleFinish}
                      requiredMark={false}
                      style={{ marginTop: 32 }}
                    >
                      <Form.Item
                        label={<span style={formLabelStyle}>อีเมล</span>}
                        name="email"
                        rules={[
                          { required: true, message: "กรุณากรอกอีเมล" },
                          { type: "email", message: "รูปแบบอีเมลไม่ถูกต้อง" },
                        ]}
                        style={{ marginBottom: 20 }}
                      >
                        <Input placeholder="example@email.com" style={inputStyle} />
                      </Form.Item>

                      <Form.Item
                        label={<span style={formLabelStyle}>รหัสผ่าน</span>}
                        name="password"
                        rules={[{ required: true, message: "กรุณากรอกรหัสผ่าน" }]}
                        style={{ marginBottom: 24 }}
                      >
                        <Input.Password placeholder="********" style={inputStyle} />
                      </Form.Item>

                      <Form.Item style={{ marginBottom: error ? 16 : 0 }}>
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={loading}
                          style={primaryButtonStyle}
                        >
                          {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                        </Button>
                      </Form.Item>

                      {error && <Alert type="error" title={error} showIcon style={{ marginBottom: 8 }} />}
                    </Form>

                    <Flex vertical gap={8} align="center" style={{ marginTop: 24 }}>
                      <Typography.Link
                        onClick={() => router.push("/login/forgot-password")}
                        style={{ color: "#0e5b50", fontSize: 14, fontWeight: 500 }}
                      >
                        ลืมรหัสผ่าน?
                      </Typography.Link>

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
