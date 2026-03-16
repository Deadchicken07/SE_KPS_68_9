"use client";

import type { ColumnsType } from "antd/es/table";
import {
  Button,
  Card,
  Input,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import { usePharmacistDeliveryHistory } from "@/hooks/usePharmacistDeliveryHistory";
import type { DeliveryHistory } from "@/types/pharmacist.types";
import {
  receiptStatusColorMap,
  receiptStatusSelectOptions,
  type ReceiptStatus,
} from "@/types/receipt-status.types";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  minimumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("th-TH", {
  dateStyle: "medium",
  timeStyle: "short",
});

const formatCurrency = (value: number | null) =>
  value === null ? "-" : currencyFormatter.format(value);

const formatDateTime = (value: string | null) =>
  value ? dateFormatter.format(new Date(value)) : "-";

export default function PharmacistDeliveryHistoryPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const {
    deliveries,
    deliveriesLoading,
    deliverySearch,
    setDeliverySearch,
    deliveryStatus,
    setDeliveryStatus,
    fetchDeliveries,
  } = usePharmacistDeliveryHistory();

  const deliveryColumns: ColumnsType<DeliveryHistory> = [
    { title: "เลขใบเสร็จ", dataIndex: "receiptId", width: 110 },
    { title: "ผู้ป่วย", dataIndex: "patientName" },
    { title: "เภสัชกร", dataIndex: "pharmacistName" },
    {
      title: "สถานะ",
      dataIndex: "status",
      render: (value: string | null) => {
        const normalizedStatus = (value || "").toLowerCase() as ReceiptStatus;
        return (
          <Tag color={receiptStatusColorMap[normalizedStatus] || "blue"}>
            {value || "-"}
          </Tag>
        );
      },
    },
    {
      title: "Tracking",
      dataIndex: "tracking",
      render: (value: string | null) => value || "-",
    },
    {
      title: "ยอดรวม",
      dataIndex: "total",
      render: (value: number | null) => formatCurrency(value),
    },
    {
      title: "วันที่",
      dataIndex: "createdAt",
      render: (value: string | null) => formatDateTime(value),
    },
  ];

  const handleFilter = async () => {
    const result = await fetchDeliveries();
    if (!result.ok) {
      messageApi.error(result.message);
    }
  };

  return (
    <main className="staff-shell">
      {contextHolder}

      <section className="staff-page-header">
        <Typography.Text className="staff-kicker">
          STAFF / DELIVERY HISTORY
        </Typography.Text>
        <Typography.Title level={2} style={{ marginTop: 8, marginBottom: 8 }}>
          ประวัติการส่งยา
        </Typography.Title>
      </section>

      <Card className="staff-content-card" variant="borderless">
        <div className="staff-toolbar">
          <Input
            value={deliverySearch}
            onChange={(event) => setDeliverySearch(event.target.value)}
            onPressEnter={() => void handleFilter()}
            placeholder="ค้นหาผู้ป่วย, tracking หรือชื่อยา"
            className="input"
          />
          <Select
            value={deliveryStatus}
            onChange={(value) => setDeliveryStatus(value)}
            style={{ width: 180 }}
            options={[
              { label: "all", value: "all" },
              ...receiptStatusSelectOptions,
            ]}
          />
          <Space>
            <Button onClick={() => void handleFilter()}>กรองข้อมูล</Button>
          </Space>
        </div>

        <Table
          rowKey="receiptId"
          loading={deliveriesLoading}
          columns={deliveryColumns}
          dataSource={deliveries}
          expandable={{
            expandedRowRender: (record) => (
              <Table
                rowKey="receiptDetailId"
                size="small"
                pagination={false}
                dataSource={record.items}
                columns={[
                  { title: "รายการ", dataIndex: "itemName" },
                  { title: "จำนวน", dataIndex: "quantity", width: 100 },
                  {
                    title: "ราคาต่อหน่วย",
                    dataIndex: "unitPrice",
                    render: (value: number | null) => formatCurrency(value),
                  },
                  {
                    title: "รวม",
                    dataIndex: "totalPrice",
                    render: (value: number | null) => formatCurrency(value),
                  },
                ]}
              />
            ),
          }}
          pagination={{ pageSize: 8 }}
        />
      </Card>
    </main>
  );
}
