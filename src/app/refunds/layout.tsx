import DashboardSidebar from "@/components/layout/DashboardSidebar";

/**
 * The same shell `/dashboard/*` gets.
 *
 * These two live at the top level because their detail pages are linked from everywhere —
 * a chat card, an email, a notification — and burying them under `/dashboard` would make
 * every one of those links longer for no gain. But the account sidebar lists them, so
 * without this layout, clicking either from the sidebar dropped the entire navigation and
 * left no way back except the browser's own button.
 */
export default function AccountSectionLayout({ children }: { children: React.ReactNode }) {
  return <DashboardSidebar>{children}</DashboardSidebar>;
}
