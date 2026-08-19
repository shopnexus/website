/**
 * Who may see the staff surface at all. Mirrors the server's `requireModerator`.
 *
 * Lives here rather than beside the shell that renders the sidebar, because the account
 * sidebar needs it too — to decide whether to draw a way in — and a layout component
 * importing a predicate out of a sibling layout component is the wrong direction.
 */
export function isStaff(role: string | undefined): boolean {
  return role === "moderator" || role === "admin";
}

/** What to call a staff member on screen. An admin passes every moderator check, so the
 *  two are worth telling apart. */
export function staffRoleLabel(role: string | undefined): string {
  return role === "admin" ? "Quản trị viên" : "Kiểm duyệt viên";
}
