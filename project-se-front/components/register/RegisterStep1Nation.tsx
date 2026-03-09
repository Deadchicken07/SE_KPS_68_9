import type { Dispatch, SetStateAction } from "react";
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
  return (
    <div className="space-y-6">
      <Label text="เลขบัตรประชาชน" />

      <input
        value={form.nationId}
        pattern="[0-9]*"
        onChange={(e) =>
          setForm((prev) => ({
            ...prev,
            nationId: e.target.value.replace(/\D/g, "").slice(0, 13),
          }))
        }
        className={`input ${errors.nationId ? "border-red-500" : ""}`}
      />

      {errors.nationId && <p className="text-red-500 text-sm">{errors.nationId}</p>}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label text="ชื่อ" />

          <input
            value={form.name}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                name: e.target.value.replace(/[^a-zA-Zก-๙\s]/g, ""),
              }))
            }
            className={`input ${errors.name ? "border-red-500" : ""}`}
          />

          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>

        <div>
          <Label text="นามสกุล" />

          <input
            value={form.surName}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                surName: e.target.value.replace(/[^a-zA-Zก-๙\s]/g, ""),
              }))
            }
            className={`input ${errors.surName ? "border-red-500" : ""}`}
          />

          {errors.surName && <p className="text-red-500 text-sm">{errors.surName}</p>}
        </div>
      </div>

      <button onClick={handleNationCheck} disabled={nationLoading} className="btn-primary">
        {nationLoading ? "กำลังตรวจสอบ..." : "ตรวจสอบ"}
      </button>
    </div>
  );
}
