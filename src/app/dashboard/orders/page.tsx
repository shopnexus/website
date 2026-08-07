import { redirect } from "next/navigation";

/**
 * There is one order screen, and it is `/orders`.
 *
 * Two of them existed: this one behind a buying/selling toggle, and a buyer-only list at
 * `/orders` — which is also where `/orders/[id]` lives, so a seller who opened an order
 * from here landed on a page whose back-link led to a list that never contained it. The
 * route stays as a redirect because the dashboard sidebar and old bookmarks point at it.
 */
export default function DashboardOrdersPage() {
  redirect("/orders");
}
