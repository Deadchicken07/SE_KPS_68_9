'use client';

import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { mapRoleIdToRole, roleHome } from '@/types/role.types';
import type {
  ClinicScheduleResponse,
  StaffScheduleFormState,
} from '@/types/staffAdminHome.types';
import {
  createStaffScheduleFormState,
  getCurrentDateKey,
  getCurrentMonthKey,
  parseStaffAdminHomeErrorMessage,
} from '@/utils/staffAdminHome';

type ClinicalRole = 'psychiatrist' | 'psychologist';
type ClinicalEditableStatus = Extract<
  StaffScheduleFormState['status'],
  'working' | 'leave'
>;

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const ROLE_ID_MAP: Record<ClinicalRole, number> = {
  psychiatrist: 4,
  psychologist: 3,
};

function getFirstDateOfMonth(monthKey: string) {
  return `${monthKey}-01`;
}

export function useClinicalLeaveSchedule(role: ClinicalRole) {
  const router = useRouter();
  const { me, loading: authLoading } = useAuth();
  const todayDateKey = getCurrentDateKey();
  const currentMonthKey = getCurrentMonthKey();
  const expectedRoleId = ROLE_ID_MAP[role];

  const [hasAccess, setHasAccess] = useState(false);
  const [month, setMonth] = useState(currentMonthKey);
  const [selectedDate, setSelectedDate] = useState(todayDateKey);
  const [data, setData] = useState<ClinicScheduleResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [form, setForm] = useState<StaffScheduleFormState>(() =>
    createStaffScheduleFormState(todayDateKey),
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    const roleId = me?.role_id ?? null;

    if (!roleId) {
      router.replace('/login');
      return;
    }

    if (roleId !== expectedRoleId) {
      const mappedRole = mapRoleIdToRole(roleId);
      router.replace(mappedRole ? roleHome[mappedRole] : '/user');
      return;
    }

    setHasAccess(true);
  }, [authLoading, expectedRoleId, me?.role_id, router]);

  useEffect(() => {
    if (!hasAccess || !me?.sub) {
      return;
    }

    const staffId = me.sub;
    let ignore = false;

    async function loadSchedule() {
      if (isLoading) {
        setIsLoading(true);
      } else {
        setIsFetching(true);
      }
      setError(null);

      const query = new URLSearchParams({
        month,
        date: selectedDate,
        staffId: String(staffId),
      });

      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        const response = await fetch(
          `${API_URL}/staff-home/clinic-schedule?${query.toString()}`,
          {
            credentials: 'include',
            headers: { ...authHeaders },
          },
        );

        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(parseStaffAdminHomeErrorMessage(payload));
        }

        if (!ignore) {
          setData(payload as ClinicScheduleResponse);
        }
      } catch (caught) {
        if (ignore) {
          return;
        }

        setError(
          caught instanceof Error
            ? caught.message
            : 'Unable to load leave schedule.',
        );
        setData(null);
      } finally {
        if (!ignore) {
          setIsLoading(false);
          setIsFetching(false);
        }
      }
    }

    void loadSchedule();

    return () => {
      ignore = true;
    };
  }, [hasAccess, me?.sub, month, selectedDate, reloadKey]);

  const scheduleEntries = data?.scheduleEntries ?? [];
  const selectedSchedule = useMemo(
    () =>
      scheduleEntries.find((entry) => entry.workDate === selectedDate) ?? null,
    [scheduleEntries, selectedDate],
  );
  const isHolidayLocked = selectedSchedule?.status === 'holiday';

  useEffect(() => {
    if (!me?.sub) {
      return;
    }

    const nextForm = {
      ...createStaffScheduleFormState(selectedDate, String(me.sub)),
      status: selectedSchedule?.status === 'leave' ? 'leave' : 'working',
      note: selectedSchedule?.note ?? '',
    } satisfies StaffScheduleFormState;

    setForm((current) => {
      if (
        current.staffId === nextForm.staffId &&
        current.workDate === nextForm.workDate &&
        current.status === nextForm.status &&
        current.note === nextForm.note
      ) {
        return current;
      }

      return nextForm;
    });
  }, [me?.sub, selectedDate, selectedSchedule]);

  const handleMonthChange = (nextMonth: string) => {
    if (!nextMonth) {
      return;
    }

    const normalizedMonth =
      nextMonth < currentMonthKey ? currentMonthKey : nextMonth;
    const nextDate =
      normalizedMonth === currentMonthKey
        ? todayDateKey
        : getFirstDateOfMonth(normalizedMonth);

    setMonth(normalizedMonth);
    setSelectedDate(nextDate);
    setFormError(null);
  };

  const handleSelectDate = (dateKey: string) => {
    if (!dateKey || dateKey < todayDateKey) {
      return;
    }

    setSelectedDate(dateKey);
    setMonth(dateKey.slice(0, 7));
    setFormError(null);
  };

  const handleStatusChange = (status: ClinicalEditableStatus) => {
    setForm((current) => ({
      ...current,
      status,
    }));
    setFormError(null);
  };

  const handleNoteChange = (note: string) => {
    setForm((current) => ({
      ...current,
      note,
    }));
    setFormError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!me?.sub) {
      setFormError('Please sign in again.');
      return;
    }

    if (!form.workDate) {
      setFormError('Please choose a date.');
      return;
    }

    if (form.workDate < todayDateKey) {
      setFormError('Past dates cannot be edited.');
      return;
    }

    if (selectedSchedule?.status === 'holiday') {
      setFormError('This date is marked as a clinic holiday.');
      return;
    }

    if (form.status === 'leave' && !form.note.trim()) {
      setFormError('Please provide a short reason for leave.');
      return;
    }

    setSubmitting(true);

    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const response = await fetch(`${API_URL}/staff-home/schedule`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({
          staffId: me.sub,
          workDate: form.workDate,
          status: form.status,
          note: form.note.trim() || null,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(parseStaffAdminHomeErrorMessage(payload));
      }

      setSelectedDate(form.workDate);
      setMonth(form.workDate.slice(0, 7));
      setReloadKey((current) => current + 1);
    } catch (caught) {
      setFormError(
        caught instanceof Error
          ? caught.message
          : 'Unable to save leave schedule.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setFormError(null);

    if (!me?.sub) {
      setFormError('Please sign in again.');
      return;
    }

    if (!selectedSchedule) {
      setFormError('No saved entry exists for the selected date.');
      return;
    }

    if (selectedSchedule.status === 'holiday') {
      setFormError('This date is marked as a clinic holiday.');
      return;
    }

    setDeleting(true);

    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const response = await fetch(`${API_URL}/staff-home/schedule`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({
          staffId: me.sub,
          workDate: selectedDate,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(parseStaffAdminHomeErrorMessage(payload));
      }

      setReloadKey((current) => current + 1);
    } catch (caught) {
      setFormError(
        caught instanceof Error
          ? caught.message
          : 'Unable to clear the selected entry.',
      );
    } finally {
      setDeleting(false);
    }
  };

  return {
    currentMonthKey,
    deleting,
    error,
    form,
    formError,
    handleDelete,
    handleMonthChange,
    handleNoteChange,
    handleSelectDate,
    handleStatusChange,
    handleSubmit,
    hasAccess,
    isFetching,
    isHolidayLocked,
    isLoading,
    month,
    scheduleEntries,
    selectedDate,
    selectedSchedule,
    submitting,
    todayDateKey,
  };
}
