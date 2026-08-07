import AdminSidebar from "@/components/layout/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminSidebar>{children}</AdminSidebar>;
}
