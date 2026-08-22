"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Hồ sơ, Bảo mật and Thông báo, as three tabs on one destination.
 *
 * They stay three routes so a link or a bookmark still opens the right one; only the sidebar
 * was collapsed to a single entry. Tabs are `Link`s, not buttons, for the same reason.
 */
const TABS = [
  { href: "/account/profile", label: "Hồ sơ" },
  { href: "/account/security", label: "Bảo mật" },
  { href: "/account/notifications", label: "Thông báo" },
];

export default function AccountSettingsTabs() {
  const pathname = usePathname();

  return (
    <nav aria-label="Cài đặt tài khoản" className="mb-6">
      <ul className="flex gap-6 border-b border-outline-variant overflow-x-auto">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`inline-block pb-3 text-label-md border-b-2 whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-t ${
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
