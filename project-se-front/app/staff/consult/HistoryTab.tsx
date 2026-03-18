"use client";

import { useState } from "react";
import { Input, List, Typography } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const mockHistory = [
  { id: 1, patient: "ผู้ป่วย #1", date: "2025-03-01", detail: "ปรึกษาเรื่องความเครียด" },
  { id: 2, patient: "ผู้ป่วย #2", date: "2025-03-05", detail: "ติดตามอาการซึมเศร้า" },
  { id: 3, patient: "ผู้ป่วย #3", date: "2025-03-10", detail: "ปรึกษาเรื่องการนอนหลับ" },
];

export default function HistoryTab() {
  const [search, setSearch] = useState("");

  const filtered = mockHistory.filter(
    (h) => h.patient.includes(search) || h.detail.includes(search)
  );

  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={4}>ประวัติการปรึกษา</Typography.Title>
      <Input
        prefix={<SearchOutlined />}
        placeholder="ค้นหาผู้ป่วยหรือรายละเอียด"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: 16 }}
      />
      <List
        dataSource={filtered}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              title={item.patient}
              description={`${item.date} — ${item.detail}`}
            />
          </List.Item>
        )}
      />
    </div>
  );
}
