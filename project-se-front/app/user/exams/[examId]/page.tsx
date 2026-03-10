'use client'

import { use, useEffect, useMemo, useState } from "react"
import { Button, Card, Flex, Pagination, Radio, Space, Spin, Tag, Typography } from "antd"
import { useQuestions } from "@/hooks/useQuestion"
import { useQuestionnaire } from "@/hooks/useQuestionnaire"
import styles from "./page.module.css"

type ChoiceOption = {
    id: number
    choice_text: string
    weight: number
}

type ExamQuestion = {
    id: number
    questionnaire_id: number
    question_text: string
    choices: ChoiceOption[]
    isMock?: boolean
}

const MOCK_CHOICE_TEMPLATES: ChoiceOption[] = [
    { id: 1, choice_text: "ไม่เห็นด้วยอย่างยิ่ง", weight: 1 },
    { id: 2, choice_text: "ไม่เห็นด้วย", weight: 2 },
    { id: 3, choice_text: "ปานกลาง", weight: 3 },
    { id: 4, choice_text: "เห็นด้วย", weight: 4 },
    { id: 5, choice_text: "เห็นด้วยอย่างยิ่ง", weight: 5 },
]

const QUESTIONS_PER_PAGE = 10

const MOCK_QUESTION_TEXTS = [
    "ฉันสามารถจัดสรรเวลาอ่านหนังสือและเวลาพักผ่อนได้อย่างเหมาะสม",
    "เมื่อเจอโจทย์ยาก ฉันยังคงพยายามหาวิธีแก้ต่อไป",
    "ฉันรู้สึกมั่นใจเมื่อต้องทำข้อสอบภายใต้เวลาจำกัด",
    "ฉันสามารถควบคุมความเครียดก่อนและระหว่างการสอบได้",
    "ฉันทบทวนบทเรียนอย่างสม่ำเสมอก่อนถึงวันสอบ",
    "ฉันกล้าถามอาจารย์หรือเพื่อนเมื่อไม่เข้าใจเนื้อหา",
    "ฉันสามารถมีสมาธิกับการอ่านหนังสือได้ต่อเนื่อง",
    "ฉันมักวางแผนการเตรียมสอบล่วงหน้าอย่างชัดเจน",
    "ฉันสามารถแยกแยะประเด็นสำคัญของบทเรียนได้ดี",
    "ฉันรู้วิธีรับมือเมื่อผลสอบออกมาไม่เป็นไปตามคาด",
    "ฉันนอนหลับเพียงพอก่อนวันสอบ",
    "ฉันอ่านคำสั่งและโจทย์อย่างละเอียดก่อนตอบ",
    "ฉันสามารถตัดสินใจเลือกคำตอบได้โดยไม่ลังเลนานเกินไป",
    "ฉันรู้สึกว่าการสอบสะท้อนความสามารถของฉันได้ค่อนข้างดี",
    "ฉันมีวิธีทบทวนเนื้อหาที่เหมาะกับตนเอง",
    "ฉันสามารถรักษาความสงบได้แม้ห้องสอบมีแรงกดดัน",
    "ฉันจัดการกับสิ่งรบกวนระหว่างอ่านหนังสือได้ดี",
    "ฉันตรวจคำตอบของตนเองก่อนส่งข้อสอบทุกครั้ง",
    "ฉันสามารถเชื่อมโยงความรู้จากหลายบทเพื่อใช้ตอบคำถามได้",
    "ฉันพร้อมสำหรับการสอบครั้งนี้ทั้งด้านเนื้อหาและสภาพจิตใจ",
]

const createMockChoices = (questionId: number) =>
    MOCK_CHOICE_TEMPLATES.map((choice, index) => ({
        ...choice,
        id: questionId * 10 + index + 1,
    }))

const buildExamQuestions = (examId: number, apiQuestions: Array<{ id: number; questionnaire_id: number; question_text: string }>) => {
    const mappedQuestions: ExamQuestion[] = apiQuestions.map((question) => ({
        id: question.id,
        questionnaire_id: question.questionnaire_id,
        question_text: question.question_text,
        choices: createMockChoices(question.id),
    }))

    if (mappedQuestions.length >= 20) {
        return mappedQuestions.slice(0, 20)
    }

    const existingTexts = new Set(mappedQuestions.map((question) => question.question_text))
    const fallbackQuestions = MOCK_QUESTION_TEXTS
        .filter((questionText) => !existingTexts.has(questionText))
        .slice(0, 20 - mappedQuestions.length)
        .map((questionText, index) => {
            const id = 9000 + index + 1
            return {
                id,
                questionnaire_id: examId,
                question_text: questionText,
                choices: createMockChoices(id),
                isMock: true,
            }
        })

    return [...mappedQuestions, ...fallbackQuestions]
}

export default function QuestionnairePage({ params }: { params: Promise<{ examId: string }> }) {
    const { examId } = use(params)
    const questionnaireId = Number(examId)
    const { questions, loading, error } = useQuestions(questionnaireId)
    const { questionnaires } = useQuestionnaire()
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})

    const examQuestions = useMemo(
        () =>
            buildExamQuestions(
                questionnaireId,
                questions.map((question) => ({
                    id: question.id,
                    questionnaire_id: question.questionnaire_id,
                    question_text: question.question_text,
                }))
            ),
        [questionnaireId, questions]
    )

    const totalPages = Math.ceil(examQuestions.length / QUESTIONS_PER_PAGE)
    const paginatedQuestions = examQuestions.slice(
        (currentPage - 1) * QUESTIONS_PER_PAGE,
        currentPage * QUESTIONS_PER_PAGE
    )
    const questionnaireTitle =
        questionnaires.find((questionnaire) => questionnaire.id === questionnaireId)?.title ??
        `ข้อสอบชุดที่ ${questionnaireId}`

    useEffect(() => {
        setCurrentPage(1)
        setSelectedAnswers({})
    }, [questionnaireId])

    if (loading) {
        return (
            <div className={styles.pageState}>
                <Spin size="large" />
                <Typography.Text>กำลังโหลดข้อสอบ...</Typography.Text>
            </div>
        )
    }

    if (error && examQuestions.length === 0) {
        return (
            <div className={styles.pageState}>
                <Typography.Title level={4}>ไม่สามารถโหลดข้อสอบได้</Typography.Title>
                <Typography.Text>{error}</Typography.Text>
            </div>
        )
    }

    if (paginatedQuestions.length === 0) {
        return (
            <div className={styles.pageState}>
                <Typography.Title level={4}>ไม่พบข้อสอบ</Typography.Title>
            </div>
        )
    }

    const answeredCount = Object.keys(selectedAnswers).length
    const progressPercent = Math.round((answeredCount / examQuestions.length) * 100)

    return (
        <div className={styles.wrapper}>
            <Card className={styles.examCard}>
                <Flex justify="space-between" align="center" wrap gap={16}>
                    <div>
                        <Typography.Title level={3} className={styles.title}>
                            {questionnaireTitle}
                        </Typography.Title>
                        <Typography.Text type="secondary">
                            ตัวอย่างหน้าทำข้อสอบแบบ mock จำนวน {examQuestions.length} ข้อ แสดงหน้าละ {QUESTIONS_PER_PAGE} ข้อ
                        </Typography.Text>
                    </div>

                    <Space size="middle" wrap>
                        <Tag color="blue">ตอบแล้ว {answeredCount}/{examQuestions.length}</Tag>
                        <Tag color="geekblue">ความคืบหน้า {progressPercent}%</Tag>
                    </Space>
                </Flex>

                <div className={styles.questionList}>
                    {paginatedQuestions.map((question, index) => {
                        const questionNumber = (currentPage - 1) * QUESTIONS_PER_PAGE + index + 1

                        return (
                            <Card key={question.id} className={styles.questionCard}>
                                <Space orientation="vertical" size={20} style={{ width: "100%" }}>
                                    <Flex justify="space-between" align="center" wrap gap={12}>
                                        <Tag color="cyan" className={styles.questionTag}>
                                            ข้อ {questionNumber} / {examQuestions.length}
                                        </Tag>
                                        {question.isMock ? <Tag color="purple">mock question</Tag> : <Tag color="green">api question</Tag>}
                                    </Flex>

                                    <Typography.Title level={4} className={styles.questionText}>
                                        {question.question_text}
                                    </Typography.Title>

                                    <Radio.Group
                                        className={styles.choiceGroup}
                                        value={selectedAnswers[question.id]}
                                        onChange={(event) =>
                                            setSelectedAnswers((prev) => ({
                                                ...prev,
                                                [question.id]: event.target.value,
                                            }))
                                        }
                                    >
                                        <Space orientation="vertical" size={14} style={{ width: "100%" }}>
                                            {question.choices.map((choice) => (
                                                <Radio key={choice.id} value={choice.id} className={styles.choiceItem}>
                                                    <span className={styles.choiceLabel}>{choice.choice_text}</span>
                                                </Radio>
                                            ))}
                                        </Space>
                                    </Radio.Group>
                                </Space>
                            </Card>
                        )
                    })}
                </div>

                <Flex justify="flex-end" align="center" wrap gap={16} className={styles.footer}>
                    <Space>
                        <Button
                            onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            ข้อก่อนหน้า
                        </Button>
                        <Button
                            type="primary"
                            className={styles.nextButton}
                            onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            หน้าถัดไป
                        </Button>
                    </Space>
                </Flex>
            </Card>
        </div>
    )
}
