"use client";
import { useRef } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function OtpInput({ value, onChange }: Props) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, val: string) => {
    if (!/^\d?$/.test(val)) return;

    const otpArray = value.split("");
    otpArray[index] = val;
    const newOtp = otpArray.join("");

    onChange(newOtp);

    if (val && inputs.current[index + 1]) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "");

    if (paste.length === 6) {
      onChange(paste);
      inputs.current[5]?.focus();
    }
  };

  return (
    <div
      className="flex justify-center gap-3"
      onPaste={handlePaste}
    >
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <input
          key={i}
          ref={(el) => {
            inputs.current[i] = el;
          }}
          value={value[i] || ""}
          maxLength={1}
          inputMode="numeric"
          autoComplete="one-time-code"
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="w-12 h-14 text-center text-xl border rounded-lg
          focus:border-[#3F7F6D] focus:ring-2 focus:ring-[#3F7F6D]/30
          outline-none"
        />
      ))}
    </div>
  );
}