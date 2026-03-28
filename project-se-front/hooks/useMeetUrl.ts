"use client";

import { useState } from "react";
import { App } from "antd";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const useMeetUrl = (onRefresh: () => void) => {
  const { message } = App.useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [link, setLink] = useState("");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [linkLoading, setLinkLoading] = useState(false);

  const [viewLinkModal, setViewLinkModal] = useState(false);
  const [viewLinkUrl, setViewLinkUrl] = useState<string | null>(null);
  const [viewLinkAppointmentId, setViewLinkAppointmentId] = useState<number | null>(null);
  const [deleteLinkLoading, setDeleteLinkLoading] = useState(false);

  const openAddModal = (appointmentId: number) => {
    setSelectedAppointmentId(appointmentId);
    setModalOpen(true);
  };

  const closeAddModal = () => {
    setModalOpen(false);
    setLink("");
  };

  const openViewModal = (url: string | null, appointmentId: number) => {
    setViewLinkUrl(url);
    setViewLinkAppointmentId(appointmentId);
    setViewLinkModal(true);
  };

  const closeViewModal = () => {
    setViewLinkModal(false);
  };

  const handleAddLink = async () => {
    if (!link.trim()) {
      message.warning("กรุณากรอกลิ้งค์");
      return;
    }
    if (!selectedAppointmentId) return;
    setLinkLoading(true);
    try {
      await axios.patch(
        `${API_URL}/appointments/${selectedAppointmentId}/meet-url`,
        { meetUrl: link.trim() },
        { withCredentials: true },
      );
      message.success("เพิ่มลิ้งค์สำเร็จ");
      closeAddModal();
      setSelectedAppointmentId(null);
      onRefresh();
    } catch {
      message.error("ไม่สามารถเพิ่มลิ้งค์ได้");
    } finally {
      setLinkLoading(false);
    }
  };

  const handleDeleteLink = async () => {
    if (!viewLinkAppointmentId) return;
    setDeleteLinkLoading(true);
    try {
      await axios.patch(
        `${API_URL}/appointments/${viewLinkAppointmentId}/meet-url/delete`,
        {},
        { withCredentials: true },
      );
      message.success("ลบลิ้งค์สำเร็จ");
      setViewLinkModal(false);
      setViewLinkUrl(null);
      setViewLinkAppointmentId(null);
      onRefresh();
    } catch {
      message.error("ไม่สามารถลบลิ้งค์ได้");
    } finally {
      setDeleteLinkLoading(false);
    }
  };

  return {
    modalOpen,
    link,
    setLink,
    linkLoading,
    openAddModal,
    closeAddModal,
    handleAddLink,
    viewLinkModal,
    viewLinkUrl,
    deleteLinkLoading,
    openViewModal,
    closeViewModal,
    handleDeleteLink,
  };
};
