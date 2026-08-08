"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import type { Contact } from "@/api/generated/types.gen";
import Button from "@/components/ui/Button";
import { useRequestContactPhoneCode, useVerifyContactPhone } from "@/hooks/api/useContacts";

/**
 * Verify the number on one saved address.
 *
 * The code entry appears only after a code has been asked for, so an unverified address
 * shows one control rather than a form nobody has a code for yet. A verified address
 * shows a badge and nothing else — there is no way to un-verify one, and there is no
 * reason to.
 */
export default function PhoneVerification({ contact }: { contact: Contact }) {
  const requestCode = useRequestContactPhoneCode();
  const verifyPhone = useVerifyContactPhone();

  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");

  if (contact.phone_verified) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
        <span className="material-symbols-outlined text-[14px]">verified</span>
        Đã xác minh
      </span>
    );
  }

  if (!sent) {
    return (
      <button
        type="button"
        disabled={requestCode.isPending}
        onClick={() =>
          requestCode.mutate(contact.id, {
            onSuccess: () => {
              setSent(true);
              toast.success("Đã gửi mã xác minh qua SMS.");
            },
          })
        }
        className="text-primary text-[11px] font-semibold hover:underline disabled:opacity-50 cursor-pointer"
      >
        {requestCode.isPending ? "Đang gửi..." : "Xác minh số điện thoại"}
      </button>
    );
  }

  return (
    <form
      className="flex items-center gap-2 mt-1"
      onSubmit={(event) => {
        event.preventDefault();
        verifyPhone.mutate(
          { id: contact.id, code: code.trim() },
          {
            onSuccess: () => {
              toast.success("Đã xác minh số điện thoại.");
              setSent(false);
              setCode("");
            },
          },
        );
      }}
    >
      <label htmlFor={`code-${contact.id}`} className="sr-only">
        Mã xác minh gửi tới {contact.phone}
      </label>
      <input
        id={`code-${contact.id}`}
        inputMode="numeric"
        autoComplete="one-time-code"
        value={code}
        onChange={(event) => setCode(event.target.value)}
        placeholder="Mã SMS"
        className="w-28 h-9 px-3 rounded-lg border border-outline focus:border-primary outline-none text-body-sm tabular-nums bg-surface-container-lowest"
      />
      <Button type="submit" size="sm" disabled={!code.trim() || verifyPhone.isPending}>
        {verifyPhone.isPending ? "..." : "Xác nhận"}
      </Button>
      <button
        type="button"
        onClick={() => setSent(false)}
        className="text-[11px] text-on-surface-variant hover:text-on-surface cursor-pointer"
      >
        Hủy
      </button>
    </form>
  );
}
