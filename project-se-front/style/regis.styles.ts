import { CSSProperties } from "react";

export const shellStyle: CSSProperties = {
  position: "relative",
  minHeight: "100vh",
  overflow: "hidden",
  padding: "32px 16px",
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
  maxWidth: 1120,
  borderRadius: 30,
  background: "rgba(255,255,255,0.84)",
  boxShadow: "0 35px 110px rgba(18, 46, 39, 0.22)",
  backdropFilter: "blur(18px)",
};

export const backButtonStyle: CSSProperties = {
  height: 44,
  paddingInline: 20,
  borderRadius: 12,
  borderColor: "rgba(14, 91, 80, 0.2)",
  color: "#0e5b50",
  fontWeight: 500,
};
