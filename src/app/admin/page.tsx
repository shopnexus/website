import { redirect } from "next/navigation";

/** The queues are the job, so the first one is the landing. */
export default function AdminPage() {
  redirect("/admin/tickets");
}
