"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import type { CreateModeratorRequest } from "@/api/generated/types.gen";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Field from "@/components/admin-config/Field";
import { useCreateModerator } from "@/hooks/api/useAdminConfig";
import { DEFAULT_MODERATOR_FORM, validateModeratorForm } from "../_lib/moderator-form";

export default function CreateModeratorDialog({ onClose }: { onClose: () => void }) {
  const create = useCreateModerator();
  const [form, setForm] = useState<CreateModeratorRequest>(DEFAULT_MODERATOR_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof CreateModeratorRequest>(key: K, value: CreateModeratorRequest[K]) =>
    setForm((previous) => ({ ...previous, [key]: value }));

  const handleSubmit = async () => {
    const found = validateModeratorForm(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    try {
      const created = await create.mutateAsync({
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
      });
      toast.success(`Đã tạo tài khoản kiểm duyệt viên ${created.name}`);
      onClose();
    } catch {
      // The global handler raises the toast — a taken email is a 409, not a field error.
    }
  };

  return (
    <Modal open title="Tạo tài khoản kiểm duyệt viên" onClose={onClose}>
      <div className="space-y-4">
        <p className="font-body-sm text-on-surface-variant">
          Không có cách nào để nâng quyền một tài khoản đang có — vai trò kiểm duyệt viên chỉ được
          cấp qua một tài khoản mới. Hãy chuyển mật khẩu bên dưới cho người dùng qua kênh an toàn
          và yêu cầu họ đổi ngay sau lần đăng nhập đầu tiên.
        </p>

        <Field label="Họ tên" error={errors.name}>
          <Input value={form.name} onChange={(event) => set("name", event.target.value)} fullWidth />
        </Field>

        <Field label="Email" hint="Cũng là tên đăng nhập." error={errors.email}>
          <Input
            type="email"
            value={form.email}
            onChange={(event) => set("email", event.target.value)}
            fullWidth
          />
        </Field>

        <Field label="Mật khẩu ban đầu" hint="8 đến 72 ký tự." error={errors.password}>
          <Input
            type="text"
            value={form.password}
            onChange={(event) => set("password", event.target.value)}
            autoComplete="off"
            fullWidth
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Quốc gia" error={errors.country}>
            <Input
              value={form.country}
              onChange={(event) => set("country", event.target.value.toUpperCase())}
              maxLength={2}
              fullWidth
            />
          </Field>
          <Field label="Ngôn ngữ" error={errors.locale}>
            <Input value={form.locale} onChange={(event) => set("locale", event.target.value)} fullWidth />
          </Field>
        </div>

        <Field label="Múi giờ" error={errors.timezone}>
          <Input value={form.timezone} onChange={(event) => set("timezone", event.target.value)} fullWidth />
        </Field>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" onClick={onClose} disabled={create.isPending}>
            Huỷ
          </Button>
          <Button onClick={handleSubmit} disabled={create.isPending}>
            {create.isPending ? "Đang tạo…" : "Tạo tài khoản"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
