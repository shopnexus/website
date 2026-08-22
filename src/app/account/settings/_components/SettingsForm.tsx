"use client";

import Link from "next/link";
import OptionList from "./OptionList";
import PickupAddressPicker from "./PickupAddressPicker";
import { useSettings } from "../_hooks/useSettings";

const CARD =
  "rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 md:p-6";

/**
 * Everything a seller can set, on one page.
 *
 * It was three tabs behind a 256px vertical nav — inside a screen that already has a 256px
 * sidebar, so the page opened with two columns of navigation side by side. What they were
 * navigating between is the part that gives it away: an address picker, and two read-only
 * lists of what the operator has enabled. Two of the three sections cannot be changed at
 * all, and the whole page fits on one screen.
 *
 * Tabs are for content that is too much to show at once, or for sections that are
 * alternatives to each other. Neither was true here, so reading this page cost three clicks
 * and a decision about which third to read first. Stacked, it costs a scroll.
 *
 * The read-only sections say so the same way, as a label rather than a sentence buried in
 * one of the two blurbs — which is how it was: carriers explained the constraint, payment
 * rails did not mention it.
 */
export default function SettingsForm() {
  const {
    contacts,
    contactsLoading,
    setDefaultPickup,
    isSaving,
    carriers,
    carriersLoading,
    rails,
    railsLoading,
  } = useSettings();

  return (
    // Capped at a readable measure: these are short lists and two sentences, and stretching
    // them across the whole content column would put four words on a line eight hundred
    // pixels wide.
    <div className="max-w-3xl space-y-5">
      <Section
        icon="local_shipping"
        title="Địa chỉ lấy hàng mặc định"
        blurb="Nơi đơn vị vận chuyển đến lấy hàng, và cũng là vị trí người mua nhìn thấy trên tin đăng của bạn."
      >
        <PickupAddressPicker
          contacts={contacts}
          loading={contactsLoading}
          saving={isSaving}
          onChoose={setDefaultPickup}
        />
      </Section>

      <Section
        icon="conveyor_belt"
        title="Đơn vị vận chuyển đang hoạt động"
        blurb="Người mua chọn một trong các đơn vị này khi thanh toán và trả phí giao hàng."
        readOnly
      >
        <OptionList
          options={carriers}
          loading={carriersLoading}
          icon="local_shipping"
          emptyLabel="Hiện chưa có đơn vị vận chuyển nào được bật."
        />
      </Section>

      <Section
        icon="payments"
        title="Người mua thanh toán bằng"
        blurb="Tiền hàng được nền tảng giữ hộ tới khi đơn kết thúc, sau đó vào số dư khả dụng của bạn."
        readOnly
      >
        <OptionList
          options={rails}
          loading={railsLoading}
          icon="credit_card"
          emptyLabel="Hiện chưa có phương thức thanh toán nào được bật."
        />
      </Section>

      {/* The bank account, the withdrawals and the tax registration all live in the wallet.
          This is a signpost, not a fourth section: duplicating those controls here would be
          two places to change one thing. */}
      <div className={`${CARD} flex flex-wrap items-center justify-between gap-4`}>
        <div>
          <h2 className="mb-1 text-title-md text-on-surface">Nhận tiền về ngân hàng</h2>
          <p className="text-body-sm text-on-surface-variant">
            Tài khoản ngân hàng, yêu cầu rút tiền và đăng ký thuế nằm trong ví của bạn.
          </p>
        </div>
        <Link
          href="/account/wallet"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-label-md text-on-primary transition-all hover:brightness-110"
        >
          Mở ví
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </Link>
      </div>
    </div>
  );
}

/**
 * One setting and what it is for.
 *
 * `readOnly` marks the sections an operator owns rather than the seller. Said as a label
 * beside the heading, in the same words both times: "why can't buyers pick express
 * delivery" is answered here rather than in support, and it has to be answered the same way
 * wherever it applies.
 */
function Section({
  icon,
  title,
  blurb,
  readOnly = false,
  children,
}: {
  icon: string;
  title: string;
  blurb: string;
  readOnly?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={CARD}>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <h2 className="flex items-center gap-2 text-title-md text-on-surface">
          <span className="material-symbols-outlined text-primary">{icon}</span>
          {title}
        </h2>
        {readOnly && (
          <span className="rounded-full bg-surface-container-high px-2 py-0.5 font-label-xs text-on-surface-variant">
            Do nền tảng cấu hình
          </span>
        )}
      </div>
      <p className="mb-5 mt-1.5 text-body-sm text-on-surface-variant">{blurb}</p>
      {children}
    </section>
  );
}
