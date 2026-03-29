"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useConsultations } from "@/hooks/useConsultation";
import {
  Button,
  Card,
  Divider,
  Modal,
  Pagination,
  Skeleton,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { InfoCircleOutlined, PlusOutlined, ReadOutlined } from "@ant-design/icons";
import { Consultation } from "@/types/consult.types";
import { useUserResponses, useResponseDetail } from "@/hooks/useResponse";
import { useStaffName, useUserName } from "@/hooks/useStaffName";
import { ResponseDetail, ResponseSummary } from "@/types/response.types";

export default function ConsultHistoryPage() {
  const searchParams = useSearchParams();
  const userId = Number(searchParams.get("userId"));
  const router = useRouter();
  const [page, setPage] = useState(1);

  // --- consultation ---
  const { data, meta, loading, error } = useConsultations(userId, page, 10);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Consultation | null>(null);

  const patientName = useUserName(userId || null);
  const staffName = useStaffName(selected?.staff_id ?? null);
  const pharmacistName = useStaffName(selected?.pharmacist_id ?? null);

  const handleOpen = (consult: Consultation) => {
    setSelected(consult);
    setOpen(true);
  };

  // --- questionnaire responses ---
  const { data: responses, loading: resLoading, error: resError } = useUserResponses(userId);
  const { getResponseDetail, loading: detailLoading } = useResponseDetail();
  const [responseDetailOpen, setResponseDetailOpen] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<ResponseDetail | null>(null);

  const handleOpenDetail = async (summary: ResponseSummary) => {
    const detail = await getResponseDetail(summary.id);
    if (detail) {
      setSelectedResponse(detail);
      setResponseDetailOpen(true);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
      <div
        style={{
          width: "80%",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* ประวัติการปรึกษา */}
        <Card
          style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)", borderRadius: 12 }}
          title={
            <Typography.Title level={4} style={{ margin: 0 }}>
              ประวัติการปรึกษา
            </Typography.Title>
          }
          extra={
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() => router.push(`/staff/consult?userId=${userId}`)}
              style={{ borderColor: "#0f766e", color: "#0f766e" }}
            >
              เพิ่มการปรึกษา
            </Button>
          }
        >
          {loading && <Skeleton active paragraph={{ rows: 4 }} />}
          {error && <Typography.Text type="danger">{error}</Typography.Text>}

          {!loading &&
            data?.map((consult) => (
              <Card
                key={consult.id}
                hoverable
                style={{ marginBottom: 12, borderRadius: 8, borderWidth: 2 }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Typography.Text>
                    {consult.created_at
                      ? new Date(consult.created_at).toLocaleDateString(
                          "th-TH",
                          {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          },
                        )
                      : "-"}
                  </Typography.Text>
                  <Tooltip title="ดูรายละเอียดการปรึกษา">
                    <ReadOutlined
                      style={{ color: "grey", cursor: "pointer" }}
                      onClick={() => handleOpen(consult)}
                    />
                  </Tooltip>
                </div>
              </Card>
            ))}

          {meta && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 16,
              }}
            >
              <Pagination
                current={meta.page}
                pageSize={meta.limit}
                total={meta.total}
                onChange={(p) => setPage(p)}
                showSizeChanger={false}
              />
            </div>
          )}
        </Card>

        {/* ประวัติการทำแบบประเมิน */}
        <Card
          style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)", borderRadius: 12 }}
          title={
            <Typography.Title level={4} style={{ margin: 0 }}>
              ประวัติการทำแบบประเมิน
            </Typography.Title>
          }
        >
          {resLoading && <Skeleton active paragraph={{ rows: 3 }} />}
          {resError && <Typography.Text type="danger">{resError}</Typography.Text>}

          {!resLoading && responses.length === 0 && (
            <Typography.Text type="secondary">ไม่มีประวัติการทำแบบประเมิน</Typography.Text>
          )}

          {!resLoading &&
            responses.map((res) => (
              <Card
                key={res.id}
                hoverable
                style={{ marginBottom: 12, borderRadius: 8, borderWidth: 2 }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <Typography.Text strong>{res.questionnaire_title}</Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {res.submitted_at
                        ? new Date(res.submitted_at).toLocaleDateString("th-TH", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })
                        : "-"}
                    </Typography.Text>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Tooltip title="ดูคำถามและคำตอบ">
                      <InfoCircleOutlined
                        style={{ fontSize: 18, color: "#0f766e", cursor: "pointer" }}
                        onClick={() => handleOpenDetail(res)}
                      />
                    </Tooltip>
                  </div>
                </div>
              </Card>
            ))}
        </Card>
      </div>

      <Modal
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingRight: 32,
            }}
          >
            <span>รายละเอียดการปรึกษา</span>
          </div>
        }
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={600}
        styles={{
          body: {
            maxHeight: "60vh",
            overflowY: "auto",
            paddingBottom: 24,
          },
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 8 }}>
          <Typography.Text type="secondary">
            ผู้ป่วย: <Typography.Text strong>{patientName ?? "-"}</Typography.Text>
          </Typography.Text>
          <Typography.Text type="secondary">
            เเพทย์: <Typography.Text strong>{staffName ?? "-"}</Typography.Text>
          </Typography.Text>
          <Typography.Text type="secondary">
            เภสัชกร: <Typography.Text strong>{pharmacistName ?? "-"}</Typography.Text>
          </Typography.Text>
        </div>
        <Divider style={{ paddingTop: 32 }}>บันทึกการปรึกษา</Divider>
        <Typography.Paragraph>
          {selected?.note ?? "ไม่มีบันทึก"}
        </Typography.Paragraph>
        <Divider style={{ paddingTop: 32 }}>ยาที่สั่ง</Divider>
        <Table
          dataSource={selected?.prescription_items ?? []}
          rowKey="id"
          pagination={false}
          columns={[
            { title: "ชื่อยา", key: "name", render: (_, record) => record.medications?.name ?? "-" },
            { title: "จำนวน", dataIndex: "quantity", key: "quantity" },
            { title: "หมายเหตุ", dataIndex: "comment", key: "comment" },
          ]}
          locale={{ emptyText: "ไม่มีรายการยา" }}
        />
      </Modal>

      <Modal
        title={
          <div style={{ paddingRight: 32 }}>
            <Typography.Text strong>{selectedResponse?.questionnaire_title}</Typography.Text>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                {selectedResponse?.submitted_at
                  ? new Date(selectedResponse.submitted_at).toLocaleDateString("th-TH", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  : "-"}
              </Typography.Text>
              <Tag color="blue">คะแนนรวม: {selectedResponse?.total_score} / 30 ({selectedResponse?.total_score != null ? Math.round((selectedResponse.total_score / 30) * 100) : '-'}%)</Tag>
            </div>
          </div>
        }
        open={responseDetailOpen}
        onCancel={() => setResponseDetailOpen(false)}
        footer={null}
        width={640}
        styles={{
          body: {
            maxHeight: "65vh",
            overflowY: "auto",
            paddingBottom: 24,
          },
        }}
      >
        {detailLoading && <Skeleton active paragraph={{ rows: 4 }} />}
        {selectedResponse?.answers.map((a, index) => (
          <Card
            key={index}
            size="small"
            style={{ marginBottom: 12, borderRadius: 8 }}
          >
            <Typography.Text strong>
              {a.question_text}
            </Typography.Text>
            <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between" }}>
              <Tag color="green">{a.choice_text}</Tag>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                น้ำหนัก: {a.weight}
              </Typography.Text>
            </div>
          </Card>
        ))}
      </Modal>
    </div>
  );
}
