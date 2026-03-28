"use client";

import { useState } from "react";
import { App } from "antd";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface JitsiResult {
  message: string;
  roomName: string;
  meetLink: string;
}

export const useJitsiMeet = () => {
  const { message } = App.useApp();

  const [jitsiModalOpen, setJitsiModalOpen] = useState(false);
  const [roomNameInput, setRoomNameInput] = useState("");
  const [jitsiLoading, setJitsiLoading] = useState(false);
  const [jitsiResult, setJitsiResult] = useState<JitsiResult | null>(null);
  const [jitsiResultModalOpen, setJitsiResultModalOpen] = useState(false);

  const openJitsiModal = () => setJitsiModalOpen(true);

  const closeJitsiModal = () => {
    setJitsiModalOpen(false);
    setRoomNameInput("");
  };

  const handleCreateJitsi = async () => {
    if (!roomNameInput.trim()) {
      message.warning("กรุณากรอกชื่อห้อง");
      return;
    }
    setJitsiLoading(true);
    try {
      const res = await axios.post<JitsiResult>(
        `${API_URL}/jitsi-meet/create`,
        { roomName: roomNameInput.trim() },
        { withCredentials: true },
      );
      setJitsiResult(res.data);
      closeJitsiModal();
      setJitsiResultModalOpen(true);
    } catch {
      message.error("ไม่สามารถสร้างลิ้งค์ได้");
    } finally {
      setJitsiLoading(false);
    }
  };

  return {
    jitsiModalOpen,
    roomNameInput,
    setRoomNameInput,
    jitsiLoading,
    jitsiResult,
    jitsiResultModalOpen,
    setJitsiResultModalOpen,
    openJitsiModal,
    closeJitsiModal,
    handleCreateJitsi,
  };
};
