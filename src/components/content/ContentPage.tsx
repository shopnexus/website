import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The shell every prose page shares.
 *
 * These pages are read once, under pressure — somebody deciding whether to trust the
 * platform with money, or looking for the rule that just cost them something. So the
 * measure is narrow, the headings are navigable, and nothing moves.
 */
export default function ContentPage({
  title,
  intro,
  updated,
  draft = false,
  children,
}: {
  title: string;
  intro?: string;
  /** ISO date of the last substantive edit. */
  updated?: string;
  /** Marks a document that describes real behaviour but has not been through legal review. */
  draft?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="max-w-[760px] mx-auto px-4 md:px-8 py-10 pb-24">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-6 font-label-md"
      >
        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        Về trang chủ
      </Link>

      <h1 className="font-headline-md text-3xl font-extrabold tracking-tight text-on-surface">
        {title}
      </h1>
      {intro && <p className="text-body-md text-on-surface-variant mt-2">{intro}</p>}
      {updated && (
        <p className="text-body-sm text-on-surface-variant mt-1">
          Cập nhật lần cuối: {new Date(updated).toLocaleDateString("vi-VN")}
        </p>
      )}

      {draft && (
        // Said plainly rather than in a footnote. A reader is entitled to know that what
        // they are being asked to agree to has not been checked by a lawyer yet.
        <div className="mt-6 flex items-start gap-3 p-4 rounded-xl border border-outline-variant bg-tertiary-container/30">
          <span className="material-symbols-outlined text-on-tertiary-container">info</span>
          <p className="text-body-sm text-on-surface">
            <strong>Bản nháp.</strong> Trang này mô tả đúng cách hệ thống ShopNexus đang vận
            hành, nhưng chưa qua rà soát pháp lý và chưa phải văn bản có hiệu lực ràng buộc.
          </p>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-8">{children}</div>
    </div>
  );
}

/** One numbered section. The heading carries an id so a rule can be linked to directly. */
export function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 flex flex-col gap-3">
      <h2 className="font-headline-sm font-bold text-on-surface">{title}</h2>
      <div className="flex flex-col gap-3 text-body-md text-on-surface leading-relaxed [&_a]:text-primary [&_a]:underline [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:pl-5 [&_li]:list-disc [&_strong]:font-bold">
        {children}
      </div>
    </section>
  );
}
