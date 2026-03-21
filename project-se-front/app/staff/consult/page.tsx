import React from "react";
import { Tabs, Card } from "antd";
import "antd/dist/reset.css";
import "./page.module.css";
import ConsultTab from "./ConsultTab";
import HistoryTab from "./HistoryTab";

const items = [
  {
    key: "1",
    label: "การปรึกษา",
    children: <ConsultTab />,
  },
  {
    key: "2",
    label: "ประวัติการปรึกษา",
    children: <HistoryTab />,
  },
];

function App() {
  return (
    <div className="container">
      <Card className="main-card">
        <Tabs items={items} className="browser-tabs" />
      </Card>
    </div>
  );
}

export default App;