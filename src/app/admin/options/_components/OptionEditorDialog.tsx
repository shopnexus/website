"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import type { Option, OptionCategoryName, SaveOptionRequest } from "@/api/generated/types.gen";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Field from "@/components/admin-config/Field";
import IdentityKey from "@/components/admin-config/IdentityKey";
import { useSaveOption } from "@/hooks/api/useAdminConfig";

const MAX_PRIORITY = 1000;

export default function OptionEditorDialog({
  option,
  category,
  providers,
  onClose,
}: {
  option: Option;
  category: OptionCategoryName;
  providers: ReadonlyArray<string>;
  onClose: () => void;
}) {
  const save = useSaveOption();
  const [name, setName] = useState(option.name);
  const [description, setDescription] = useState(option.description);
  const [provider, setProvider] = useState(option.provider);
  const [priority, setPriority] = useState(String(option.priority ?? 0));

  // A provider this deployment never registered is a 422 at the till, so the picker is
  // built from what the server says it has rather than from anything typed here.
  const knownProviders = providers.includes(option.provider)
    ? providers
    : [...providers, option.provider];

  const handleSubmit = async () => {
    const body: SaveOptionRequest = {
      name: name.trim(),
      description: description.trim(),
      provider,
      priority: Math.min(MAX_PRIORITY, Math.max(0, Number(priority) || 0)),
    };
    try {
      await save.mutateAsync({ id: option.id, category, body });
      toast.success(`Đã lưu ${body.name}`);
      onClose();
    } catch {
      // The global handler raises the toast — an unregistered provider is a 422.
    }
  };

  return (
    <Modal open title="Sửa tuỳ chọn" onClose={onClose}>
      <div className="space-y-4">
        <div className="rounded-2xl border border-tertiary-container/60 bg-tertiary-container/10 px-4 py-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-label-md text-on-surface">Mã tuỳ chọn</span>
            <IdentityKey value={option.id} weight="settled" />
          </div>
          <p className="font-body-sm text-on-surface-variant">
            Mã này không đổi được. Mọi giao dịch đã thanh toán và mọi đơn đã gửi đi đều lưu nó dưới
            dạng chữ thường — đổi mã sẽ làm những bản ghi đó không còn tra ra được cổng nào đã xử lý.
            Tên hiển thị và nhà cung cấp thì đổi thoải mái.
          </p>
        </div>

        <Field label="Tên hiển thị" hint="Đây là thứ người mua thấy khi chọn. Tối đa 200 ký tự.">
          <Input value={name} onChange={(event) => setName(event.target.value)} maxLength={200} fullWidth />
        </Field>

        <Field label="Mô tả" hint="Một dòng giải thích cho người mua. Tối đa 1000 ký tự.">
          <Input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={1000}
            fullWidth
          />
        </Field>

        <Field
          label="Nhà cung cấp"
          hint="Bản triển khai thực sự xử lý dòng này. Đổi nhà cung cấp không đổi mã, nên các đơn cũ vẫn trỏ đúng dòng này."
        >
          <select
            value={provider}
            onChange={(event) => setProvider(event.target.value)}
            className="w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-on-surface outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/15"
          >
            {knownProviders.map((candidate) => (
              <option key={candidate} value={candidate}>
                {candidate}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Thứ tự ưu tiên" hint="0 đến 1000. Số lớn hơn được xếp lên trên trong danh sách chọn.">
          <Input
            type="number"
            min={0}
            max={MAX_PRIORITY}
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
            fullWidth
          />
        </Field>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" onClick={onClose} disabled={save.isPending}>
            Huỷ
          </Button>
          <Button onClick={handleSubmit} disabled={save.isPending || !name.trim()}>
            {save.isPending ? "Đang lưu…" : "Lưu thay đổi"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
