"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { notification } from "antd";
import { useLogin } from "@/hooks/useLogin";

function LoginContent() {
  const [api, contextHolder] = notification.useNotification();
  const { login, loading, error } = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      router.push("/user");
    } catch {
      // managed by hook
    }
  };

  return (
    <>
      {contextHolder}

      <main className="auth-shell flex items-center justify-center px-4 py-8 sm:px-8 sm:py-12">
        <div className="auth-orb top-[-140px] left-[-120px] h-[280px] w-[280px] bg-[#2f6e5d]/35" />
        <div className="auth-orb alt bottom-[-170px] right-[-120px] h-[320px] w-[320px] bg-[#4e987f]/35" />

        <section className="w-full max-w-7xl overflow-hidden rounded-[34px] bg-white/20 shadow-[0_45px_120px_rgba(25,56,48,0.24)] backdrop-blur-sm">
          <div className="grid min-h-[740px] grid-cols-1 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="auth-panel-premium relative hidden overflow-hidden p-12 text-white lg:block xl:p-16">
              <div className="absolute -right-16 top-12 h-52 w-52 rounded-full bg-white/12 blur-3xl" />
              <div className="absolute -bottom-16 -left-8 h-72 w-72 rounded-full bg-white/15 blur-3xl" />

              <div className="relative z-10 flex h-full flex-col justify-between">
                <div>
                  <p className="inline-flex rounded-full bg-white/10 px-4 py-1 text-xs tracking-[0.18em] text-white/90">
                    MENTALCARE PLATFORM
                  </p>

                  <h1 className="mt-8 text-5xl font-semibold leading-[1.1] xl:text-6xl">
                    JITDEE
                    <br />
                   
                  </h1>

                  <p className="mt-7 max-w-xl text-base leading-relaxed text-white/88 xl:text-lg">
                    ระบบให้คำปรึกษาออนไลน์ที่ออกแบบเพื่อความปลอดภัย ความเป็นส่วนตัว และประสบการณ์ใช้งานที่ลื่นไหลทุกอุปกรณ์
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-white/90">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-3xl font-semibold">24/7</p>
                    <p className="mt-1 text-white/80">ดูแลต่อเนื่อง</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-3xl font-semibold">AES</p>
                    <p className="mt-1 text-white/80">ข้อมูลปลอดภัย</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative flex items-center justify-center p-6 sm:p-10 xl:p-14">
              <div className="auth-card w-full max-w-md p-8 sm:p-10">
                {/* <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#3f7f6d]/75">Welcome back</p> */}
                <h2 className="mt-3 text-3xl font-semibold text-[#1d493d]">เข้าสู่ระบบ</h2>
                {/* <p className="mt-2 text-sm text-slate-500">ลงชื่อเข้าใช้เพื่อเข้าถึงระบบจัดการและบริการทั้งหมด</p> */}

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  <div>
                    <label className="text-sm font-medium text-slate-600">อีเมล</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="example@email.com"
                      className="input mt-2"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-600">รหัสผ่าน</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="********"
                      className="input mt-2"
                    />
                  </div>

                  <button type="submit" disabled={loading} className="btn-primary mt-2">
                    {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                  </button>

                  {error && <p className="text-center text-sm text-red-500">{error}</p>}
                </form>

                <div className="mt-6 text-center text-sm text-slate-500">
                  <span
                    onClick={() => router.push("/login/forgot-password")}
                    className="cursor-pointer font-medium text-[#2f6e5d] hover:underline"
                  >
                    ลืมรหัสผ่าน?
                  </span>
                </div>

                <div className="mt-2 text-center text-sm text-slate-600">
                  ยังไม่มีบัญชี?{" "}
                  <span
                    onClick={() => router.push("/login/regis")}
                    className="cursor-pointer font-semibold text-[#2f6e5d] hover:underline"
                  >
                    สมัครสมาชิก
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
