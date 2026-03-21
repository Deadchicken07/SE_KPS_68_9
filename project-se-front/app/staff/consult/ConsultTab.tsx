"use client";

import { Typography } from "antd";

export default function ConsultTab() {
  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={4}>การปรึกษา</Typography.Title>
      <iframe
        src="https://meet.jit.si"
        width="100%"
        height="500px"
        style={{ border: "none", borderRadius: 8 }}
      />
    </div>
  );
}
