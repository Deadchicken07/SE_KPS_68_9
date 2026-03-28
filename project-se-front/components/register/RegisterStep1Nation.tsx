import type { Dispatch, SetStateAction } from "react";
import { Button, Input } from "antd";
import type { FormErrors, RegisterForm } from "@/types/Register.types";
import Label from "./Label";

interface RegisterStep1Props {
  form: Pick<RegisterForm, "nationId" | "name" | "surName">;
  errors: Pick<FormErrors, "nationId" | "name" | "surName">;
  setForm: Dispatch<SetStateAction<RegisterForm>>;
  handleNationCheck: () => void;
  nationLoading: boolean;
}

export default function RegisterStep1Nation({
  form,
  errors,
  setForm,
  handleNationCheck,
  nationLoading,
}: RegisterStep1Props) {
  const isStepComplete =
    /^\d{13}$/.test(form.nationId) &&
    form.name.trim().length > 0 &&
    form.surName.trim().length > 0;

  return (
    <div className="mb-12">
      <div className="space-y-7">
        <div>
          <Label text="เลขบัตรประชาชน" />
          <Input
            size="large"
            value={form.nationId}
            pattern="[0-9]*"
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                nationId: e.target.value.replace(/\D/g, "").slice(0, 13),
              }))
            }
            status={errors.nationId ? "error" : undefined}
            className="input mt-2"
          />
          {errors.nationId && (
            <p className="mt-2 text-sm text-red-500">{errors.nationId}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-6 pt-2">
          <div>
            <Label text="ชื่อ" />
            <Input
              size="large"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  name: e.target.value.replace(/[^a-zA-Zก-๙\s]/g, ""),
                }))
              }
              status={errors.name ? "error" : undefined}
              className="input mt-2"
            />
            {errors.name && (
              <p className="mt-2 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <Label text="นามสกุล" />
            <Input
              size="large"
              value={form.surName}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  surName: e.target.value.replace(/[^a-zA-Zก-๙\s]/g, ""),
                }))
              }
              status={errors.surName ? "error" : undefined}
              className="input mt-2"
            />
            {errors.surName && (
              <p className="mt-2 text-sm text-red-500">{errors.surName}</p>
            )}
          </div>
        </div>

        <div className="pt-2">
          <Button
            type="primary"
            size="large"
            onClick={handleNationCheck}
            disabled={!isStepComplete}
            loading={nationLoading}
            className="btn-primary w-full"
          >
            {nationLoading
              ? "ตรวจสอบเลขบัตรประชาชน..."
              : "ตรวจสอบเลขบัตรประชาชน"}
          </Button>
        </div>
      </div>
    </div>
  );
}