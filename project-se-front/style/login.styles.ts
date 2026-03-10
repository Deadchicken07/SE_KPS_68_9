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

export const outerPanelStyle: CSSProperties = {
  width: "100%",
  maxWidth: 1320,
  overflow: "hidden",
  borderRadius: 34,
  background: "rgba(255,255,255,0.2)",
  backdropFilter: "blur(14px)",
  boxShadow: "0 45px 120px rgba(25, 56, 48, 0.24)",
};

export const premiumPanelStyle: CSSProperties = {
  position: "relative",
  overflow: "hidden",
  minHeight: 740,
  padding: 48,
  color: "#ffffff",
  background: "linear-gradient(125deg, #0c423c 0%, #155f54 58%, #c09057 100%)",
};

export const premiumGlowStyle: CSSProperties = {
  position: "absolute",
  borderRadius: "9999px",
  background: "rgba(255,255,255,0.12)",
  filter: "blur(48px)",
};

export const loginCardStyle: CSSProperties = {
  width: "100%",
  maxWidth: 460,
  borderRadius: 30,
  background: "rgba(255,255,255,0.82)",
  boxShadow: "0 35px 110px rgba(18, 46, 39, 0.22)",
  backdropFilter: "blur(18px)",
};

export const formLabelStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 500,
  color: "#475569",
};

export const primaryButtonStyle: CSSProperties = {
  width: "100%",
  height: 52,
  border: "none",
  borderRadius: 12,
  fontWeight: 600,
  background: "linear-gradient(90deg, #0e5b50 0%, #155f54 100%)",
  boxShadow: "0 16px 30px rgba(14, 91, 80, 0.22)",
};

export const inputStyle: CSSProperties = {
  height: 50,
  borderRadius: 12,
  borderColor: "#dbe1dc",
  background: "#fbf8f4",
};