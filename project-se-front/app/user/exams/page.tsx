'use client'

import { Button, Card, Col, Flex, List, Row } from "antd"
import styles from "./Exam.module.css"
import { useQuestionnaire } from "@/hooks/useQuestionnaire"
import { useRouter } from "next/navigation"


export default function ExamsPage(){
    const {questionnaires,loading,error} =  useQuestionnaire()
    const router = useRouter()
    return(
        <div style={{padding : 24}}>
            <Card 
                title='ชุดข้อสอบที่เปิดให้ทำการทดสอบ'
                style={{
                    borderRadius: 14,
                    borderWidth: 5,
                    width: 700,
                    margin: '0 auto'
                }}
            >
                <Flex vertical gap={16}>
                    {questionnaires.map((questionnaires) => (
                        <Flex
                            key={questionnaires.id}
                            justify="space-between"
                            align="center"
                            className={styles.examItem}
                        >
                            <div>
                                <div style={{ fontWeight: 600, fontSize: 16 }}>
                                {questionnaires.title}
                                </div>
                            </div>

                            <Button 
                                type="primary" 
                                size="middle" 
                                className={styles.button} 
                                onClick={() => router.push(`exams/${questionnaires.id}`)}
                            >
                                ทำข้อสอบ
                            </Button>
                        </Flex>
                    ))}
                </Flex>
            </Card>
        </div>
    )
}