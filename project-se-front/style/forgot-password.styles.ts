import { CSSProperties } from "react";

export const shellStyle: CSSProperties = {
  position: "relative",
  minHeight: "100vh",
  overflow: "hidden",
  padding: "40px 16px",
  background:
    "radial-gradient(circle at 15% 20%, rgba(14, 91, 80, 0.16), transparent 46%), radial-gradient(circle at 85% 78%, rgba(192, 144, 87, 0.14), transparent 46%), linear-gradient(135deg, #f8f3ed 0%, #efe6da 52%, #e8dccd 100%)",
};

export const orbBaseStyle: CSSProperties = {
  position: "absolute",
  borderRadius: "9999px",
  filter: "blur(48px)",
  pointerEvents: "none",
};
export const cardStyle: CSSProperties = {
  width: "100%",
  maxWidth: 760,
  borderRadius: 30,
  background: "rgba(255,255,255,0.84)",
  boxShadow: "0 35px 110px rgba(18, 46, 39, 0.22)",
  backdropFilter: "blur(18px)",
};

export const inputStyle: CSSProperties = {
  height: 50,
  borderRadius: 12,
  borderColor: "#dbe1dc",
  background: "#fbf8f4",
};

export const buttonStyle: CSSProperties = {
  width: "100%",
  height: 50,
  border: "none",
  borderRadius: 12,
  fontWeight: 600,
  background: "linear-gradient(90deg, #0e5b50 0%, #155f54 100%)",
  boxShadow: "0 16px 30px rgba(14, 91, 80, 0.22)",
};

export const labelStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 500,
  color: "#475569",
};
