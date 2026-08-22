"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import QuantitySelector from "@/components/ui/QuantitySelector";
import { formatMoney } from "@/lib/money";
import { ceilingFor, isAtOrAboveAsking, priceGap, suggestedTotal } from "./offer.logic";

/**
 * The body of both negotiation dialogs: what you propose, how many, and why.
 *
 * One component because it was one form written twice. Opening a negotiation and answering one
 * ask for exactly the same three things and hold exactly the same rule — the total has to sit
 * under the asking price for that quantity — and the rule was implemented in both files, with
 * near-identical comments, drifting on the details: one showed the parsed amount back, the other
 * did not; one formatted the ceiling in the error, the other formatted it differently.
 *
 * What the caller still owns is the request: creating takes a variant, countering takes an offer
 * id. That is the whole difference, so it is the whole prop.
 */
export default function OfferForm({
  unitPrice,
  currency,
  standing,
  asSeller = false,
  submitLabel,
  isPending,
  onSubmit,
  onCancel,
}: {
  /** The variant's listed price. Undefined when it could not be resolved — see `ceilingFor`. */
  unitPrice: number | undefined;
  currency: string;
  /** The proposal being answered, and its quantity. Absent when opening a negotiation. */
  standing?: { total: number; quantity: number; from: string };
  /** Whether the reader is the one selling — decides which way the suggested number moves. */
  asSeller?: boolean;
  submitLabel: string;
  isPending: boolean;
  onSubmit: (terms: { total: number; quantity: number; reason: string }) => void;
  onCancel: () => void;
}) {
  const [raw, setRaw] = useState("");
  const [quantity, setQuantity] = useState(standing?.quantity ?? 1);
  const [reason, setReason] = useState("");

  const total = Number.parseInt(raw.replace(/\D/g, ""), 10);
  const typed = Number.isFinite(total) && total > 0;

  const ceiling = ceilingFor(unitPrice, quantity);
  const refused = typed && isAtOrAboveAsking(total, ceiling);
  const valid = typed && quantity > 0 && !refused;
  const gap = typed && !refused ? priceGap(total, ceiling) : null;
  const suggestion = suggestedTotal({ ceiling, standing: standing?.total, asSeller });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!valid || isPending) return;
        onSubmit({ total, quantity, reason: reason.trim() });
      }}
      className="flex flex-col gap-5"
    >
      {/* What is being answered, and what the ceiling is. A price field with neither is a field
          you type into and then find out about. */}
      <dl className="flex flex-col gap-1.5 rounded-xl bg-surface-container-low px-4 py-3 font-body-sm">
        {standing && (
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-on-surface-variant">{standing.from} đang đề nghị</dt>
            <dd className="font-title-sm font-bold tabular-nums text-on-surface">
              {formatMoney(standing.total, currency)}
            </dd>
          </div>
        )}
        {unitPrice !== undefined && (
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-on-surface-variant">Giá niêm yết</dt>
            <dd className="tabular-nums text-on-surface">
              {formatMoney(unitPrice, currency)}
              {quantity > 1 && ` × ${quantity}`}
            </dd>
          </div>
        )}
      </dl>

      <div className="flex flex-col gap-2">
        <label htmlFor="offer-total" className="font-label-md font-bold text-on-surface">
          Mức giá bạn đề nghị {quantity > 1 && <span className="font-normal">(tổng cho {quantity} sản phẩm)</span>}
        </label>
        <div className="relative">
          <input
            id="offer-total"
            inputMode="numeric"
            autoComplete="off"
            value={raw}
            // Grouped as it is typed. A seven-digit number in a box with no separators is one
            // nobody can proof-read, and a mistyped zero here is a mistyped zero on a price.
            onChange={(event) => {
              const digits = event.target.value.replace(/\D/g, "");
              setRaw(digits === "" ? "" : new Intl.NumberFormat("vi-VN").format(Number(digits)));
            }}
            placeholder={
              suggestion !== undefined
                ? new Intl.NumberFormat("vi-VN").format(suggestion)
                : "Nhập số tiền"
            }
            aria-invalid={refused}
            aria-describedby="offer-total-note"
            className={[
              "w-full rounded-xl border bg-surface-container-lowest px-4 py-3 pr-12 font-title-md tabular-nums outline-none transition-colors",
              refused
                ? "border-error focus:border-error"
                : "border-outline-variant focus:border-primary",
            ].join(" ")}
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-body-md text-on-surface-variant">
            ₫
          </span>
        </div>

        {/* One line, three jobs: the refusal, the discount being proposed, or the hint about the
            suggested number — whichever the field currently warrants. */}
        <p id="offer-total-note" className="min-h-[20px] font-body-sm" aria-live="polite">
          {refused ? (
            <span className="text-error">
              Phải thấp hơn giá niêm yết
              {ceiling !== undefined && ` (${formatMoney(ceiling, currency)})`} — bằng giá thì bạn
              bấm “Mua ngay” là xong.
            </span>
          ) : gap ? (
            <span className="text-on-surface-variant">
              Thấp hơn giá niêm yết{" "}
              <span className="font-semibold text-primary">{gap.percent}%</span>
            </span>
          ) : suggestion !== undefined && !typed ? (
            <span className="text-on-surface-variant">
              Bỏ trống sẽ không gửi được — số mờ ở trên là một mức thường được đề nghị.
            </span>
          ) : null}
        </p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <span className="font-label-md font-bold text-on-surface">Số lượng</span>
        <QuantitySelector value={quantity} onChange={setQuantity} min={1} max={99} />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="offer-reason" className="font-label-md font-bold text-on-surface">
          Lời nhắn <span className="font-normal text-on-surface-variant">(không bắt buộc)</span>
        </label>
        <textarea
          id="offer-reason"
          rows={3}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Vì sao bạn đề nghị mức này? Người bán dễ đồng ý hơn khi biết lý do."
          className="w-full resize-none rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md outline-none transition-colors focus:border-primary"
        />
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" type="button" onClick={onCancel} disabled={isPending}>
          Hủy
        </Button>
        <Button variant="primary" type="submit" disabled={!valid || isPending} className="sm:px-8">
          {isPending ? "Đang gửi..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
