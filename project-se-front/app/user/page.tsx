export default function Home() {
  return (
    <section
      style={{
        width: "100%",
        height: "420px",
        position: "relative",
        backgroundImage:
          "url('https://picsum.photos/1600/800')", 
        backgroundSize: "cover",
        backgroundPosition: "center",
        borderRadius: 20,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.35)",
        }}
    />
      <div
        style={{
          position: "relative",
          zIndex: 2,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: 80,
          color: "#fff",
        }}
      >
        <h1 style={{ fontSize: 42, fontWeight: "bold", marginBottom: 16 }}>
          ไม่รู้ตั้งอะไรดี
        </h1>

        <p style={{ fontSize: 18, marginBottom: 24 }}>
          ใส่ไรดีวะ
        </p>

        <button
          style={{
            width: 160,
            height: 45,
            backgroundColor: "#0f766e",
            border: "none",
            borderRadius: 30,
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          ดูรายละเอียด
        </button>
      </div>
    </section>
  );
}