export default function LoginPage() {
  return (
    <div className="min-h-screen flex bg-[#E8EAD9] overflow-hidden">

      {/* ================= LEFT SECTION ================= */}
      <div className="hidden md:flex w-[65%] relative overflow-hidden bg-gradient-to-br from-[#2f6e5d] via-[#3F7F6D] to-[#4A8F7A] text-white">

        {/* Light Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.15),transparent_40%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.1),transparent_40%)]"></div>

        {/* Decorative Blur */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-24 max-w-2xl">

          <div className="text-sm tracking-widest uppercase opacity-80 mb-8">
            MentalCare Platform
          </div>

          <h1 className="text-6xl font-bold leading-tight mb-6">
            ดูแลสุขภาพใจ<br />
            อย่างมืออาชีพ
          </h1>

          <p className="text-xl opacity-90 leading-relaxed mb-10">
            ระบบให้คำปรึกษาออนไลน์ที่ออกแบบเพื่อความปลอดภัย
            และความเป็นส่วนตัวระดับมาตรฐานทางการแพทย์
          </p>

          {/* Inline SVG Illustration */}
          <div className="w-96 opacity-90">
            <svg viewBox="0 0 500 300" fill="none">
              <circle cx="120" cy="150" r="60" fill="rgba(255,255,255,0.2)" />
              <rect x="200" y="80" width="180" height="120" rx="20" fill="rgba(255,255,255,0.15)" />
              <circle cx="260" cy="140" r="20" fill="white" />
              <circle cx="320" cy="140" r="20" fill="white" />
              <rect x="250" y="170" width="80" height="10" rx="5" fill="white" />
            </svg>
          </div>

        </div>
      </div>

      {/* ================= RIGHT SECTION ================= */}
      <div className="flex w-full md:w-[35%] items-center justify-center px-8">

        <div className="w-full max-w-md">

          <div className="bg-white rounded-3xl p-12 shadow-[0_30px_80px_rgba(0,0,0,0.15)] border border-gray-100">

            <h2 className="text-3xl font-semibold text-[#3F7F6D] mb-10">
              เข้าสู่ระบบ
            </h2>

            <form className="space-y-7">

              <div>
                <label className="text-sm text-gray-500 tracking-wide">
                  อีเมล
                </label>
                <input
                  type="email"
                  placeholder="example@email.com"
                  className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-200 focus:border-[#4A8F7A] focus:ring-2 focus:ring-[#4A8F7A]/30 outline-none transition"
                />
              </div>

              <div>
                <label className="text-sm text-gray-500 tracking-wide">
                  รหัสผ่าน
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-200 focus:border-[#4A8F7A] focus:ring-2 focus:ring-[#4A8F7A]/30 outline-none transition"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-4 bg-[#3F7F6D] hover:bg-[#356e5f] text-white py-3 rounded-xl text-lg font-medium shadow-lg transition duration-300"
              >
                เข้าสู่ระบบ
              </button>

            </form>

            <div className="text-center mt-8 text-sm text-gray-500 hover:underline cursor-pointer">
              ลืมรหัสผ่าน?
            </div>

            <div className="text-center mt-2 text-sm text-gray-600">
              ยังไม่มีบัญชี?{" "}
              <span className="text-[#3F7F6D] font-medium cursor-pointer hover:underline">
                สมัครสมาชิก
              </span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}