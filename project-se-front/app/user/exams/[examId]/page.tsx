"use client";

import { useQuestionnaires } from "@/hooks/useQuestionnaire";
import { useSubmitResponse } from "@/hooks/useSubmitResponse";
import { App, Button, Card, Flex, Modal, Pagination, Radio, Spin, Tag, Typography } from "antd";
import { useParams } from "next/navigation";
import styles from "./page.module.css";
import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";

export default function QuestionsPage() {
  const { modal } = App.useApp();
  const { me } = useAuth();
  const { examId } = useParams();
  const [page, setPage] = useState(1);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [weights, setWeights] = useState<Record<number, number>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const { data, meta, loading, error } = useQuestionnaires(Number(examId), page);
  const { submit, loading: submitting } = useSubmitResponse();

  const totalScore = Object.values(weights).reduce((sum, w) => sum + w, 0);

  const getScoreLevel = (score: number) => {
    if (score <= 10) return { label: "ระดับน้อย", color: "green" };
    if (score <= 20) return { label: "ระดับปานกลาง", color: "orange" };
    return { label: "ระดับมาก", color: "red" };
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < (meta?.total ?? 0)) {
      modal.warning({
        title: "ตอบไม่ครบ",
        content: `กรุณาตอบให้ครบทุกข้อ (ตอบแล้ว ${Object.keys(answers).length}/${meta?.total} ข้อ)`,
        centered: true,
      });
      return;
    }
    await submit({
      questionnaire_id: Number(examId),
      user_id: me?.sub ?? null,
      answers: Object.entries(answers).map(([question_id, choice_id]) => ({
        question_id: Number(question_id),
        choice_id,
      })),
    });
    setModalOpen(true);
  };

  if (loading)
    return (
      <div className={styles.pageState}>
        <Spin size="large" />
        <Typography.Text type="secondary">กำลังโหลดแบบทดสอบ...</Typography.Text>
      </div>
    );

  if (error)
    return (
      <div className={styles.pageState}>
        <Typography.Text type="danger">{error}</Typography.Text>
      </div>
    );

  return (
    <div className={styles.wrapper}>
      <div className={styles.examCard}>
        <div className={styles.header}>
          <Tag color="teal" className={styles.headerTag}>แบบทดสอบ</Tag>
          <Typography.Title level={3} className={styles.title}>
            {data?.title}
          </Typography.Title>
          <Typography.Text type="secondary">
            {data?.questions?.length} ข้อ
          </Typography.Text>
        </div>
        <div className={styles.questionList}>
          {data?.questions?.map((question, index) => (
            <Card key={question.id} className={styles.questionCard}>
              <Flex gap={16} align="flex-start">
                <div className={styles.questionNumber}>{(page - 1) * (meta?.limit ?? 5) + index + 1}</div>
                <Flex vertical gap={16} style={{ flex: 1 }}>
                  <Typography.Paragraph strong className={styles.questionText}>
                    {question.question_text}
                  </Typography.Paragraph>
                  <Radio.Group
                    className={styles.choiceGroup}
                    value={answers[question.id]}
                    onChange={(e) => {
                      const choiceId = e.target.value;
                      const weight = question.choices?.find((c) => c.id === choiceId)?.weight ?? 0;
                      setAnswers((prev) => ({ ...prev, [question.id]: choiceId }));
                      setWeights((prev) => ({ ...prev, [question.id]: weight }));
                    }}
                  >
                    <Flex vertical gap={10}>
                      {question.choices?.map((choice) => (
                        <Radio
                          key={choice.id}
                          value={choice.id}
                          className={styles.choiceItem}
                        >
                          <span className={styles.choiceLabel}>
                            {choice.choice_text}
                          </span>
                        </Radio>
                      ))}
                    </Flex>
                  </Radio.Group>
                </Flex>
              </Flex>
            </Card>
          ))}
        </div>
        <Flex justify="flex-end" style={{marginTop : 24}}>
          <Pagination
            current={meta?.page}
            pageSize={meta?.limit}
            total={meta?.total}
            onChange={(p) => setPage(p)}
          />
        </Flex>

        {/* Footer */}
        <Flex justify="flex-end" className={styles.footer}>
          <Button
            type="primary"
            size="large"
            loading={submitting}
            onClick={handleSubmit}
            className={styles.submitButton}
          >
            ส่งคำตอบ
          </Button>
        </Flex>
      </div>

      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={<Button type="primary" onClick={() => setModalOpen(false)}>ปิด</Button>}
        centered
      >
        <Flex vertical align="center" gap={8} style={{ padding: "24px 0" }}>
          <Typography.Title level={4}>ผลการทำแบบทดสอบ</Typography.Title>
          <Typography.Text>คะแนนรวม: <strong>{totalScore}</strong> คะแนน</Typography.Text>
          <Tag color={getScoreLevel(totalScore).color} style={{ fontSize: 16, padding: "4px 16px" }}>
            {getScoreLevel(totalScore).label}
          </Tag>
        </Flex>
      </Modal>
    </div>
  );
}
