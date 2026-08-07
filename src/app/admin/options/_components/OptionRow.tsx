"use client";

import type { Option } from "@/api/generated/types.gen";
import IdentityKey from "@/components/admin-config/IdentityKey";

/**
 * One configured rail or carrier.
 *
 * The row never offers a delete, because there is no delete: switching it off takes it out
 * of the buyer's chooser and leaves it resolvable for every settled payment and shipped
 * parcel that names it. The switched-off state is therefore drawn as *muted and still
 * present* rather than as a warning — it is a normal operating state, not damage.
 */
export default function OptionRow({
  option,
  onEdit,
  onToggle,
  isBusy,
}: {
  option: Option;
  onEdit: () => void;
  onToggle: () => void;
  isBusy: boolean;
}) {
  const isEnabled = option.is_enabled ?? true;

  return (
    <li
      className={[
        "px-5 py-4 flex flex-wrap items-start justify-between gap-4 transition-colors",
        isEnabled ? "" : "bg-surface-container-low/50",
      ].join(" ")}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={["font-label-md", isEnabled ? "text-on-surface" : "text-on-surface-variant"].join(" ")}>
            {option.name}
          </span>
          {!isEnabled && (
            <span className="rounded-full bg-surface-container-high px-2 py-0.5 font-label-sm text-on-surface-variant">
              Đang tắt — không hiện khi thanh toán
            </span>
          )}
        </div>

        <p className="font-body-sm text-on-surface-variant mt-1">
          {option.description || "Chưa có mô tả"}
        </p>

        <div className="flex flex-wrap items-center gap-3 mt-2">
          <IdentityKey
            value={option.id}
            weight="settled"
            title="Mã cố định vĩnh viễn — nhấn để sao chép"
          />
          <span className="font-body-sm text-on-surface-variant">
            Nhà cung cấp <span className="font-mono text-on-surface">{option.provider}</span>
          </span>
          <span className="font-body-sm text-on-surface-variant">Ưu tiên {option.priority ?? 0}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onEdit}
          className="px-3 py-1.5 rounded-full border border-outline-variant font-label-sm text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
        >
          Sửa
        </button>
        <button
          type="button"
          role="switch"
          aria-checked={isEnabled}
          aria-label={isEnabled ? `Tắt ${option.name}` : `Bật ${option.name}`}
          disabled={isBusy}
          onClick={onToggle}
          className={[
            "relative w-12 h-7 rounded-full transition-colors cursor-pointer disabled:opacity-50",
            isEnabled ? "bg-primary" : "bg-surface-variant",
          ].join(" ")}
        >
          <span
            className={[
              "absolute top-1 w-5 h-5 rounded-full bg-surface-container-lowest shadow transition-all",
              isEnabled ? "left-6" : "left-1",
            ].join(" ")}
          />
        </button>
      </div>
    </li>
  );
}
