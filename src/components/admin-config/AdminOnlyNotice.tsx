/**
 * Why a moderator is looking at a page with no buttons.
 *
 * Used two ways: on top of a read-only list (categories, tags — both are public reads), and
 * in place of one the server will not answer at all for a moderator (options).
 */
export default function AdminOnlyNotice({ detail }: { detail: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-outline-variant bg-surface-container-low px-4 py-3 mb-5">
      <span className="material-symbols-outlined text-[20px] text-on-surface-variant">lock</span>
      <div>
        <p className="font-label-md text-on-surface">Chỉ quản trị viên chỉnh sửa được</p>
        <p className="font-body-sm text-on-surface-variant mt-0.5">{detail}</p>
      </div>
    </div>
  );
}
