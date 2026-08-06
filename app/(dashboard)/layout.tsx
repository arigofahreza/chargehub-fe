import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-page)" }}>
      <Sidebar />
      <div className="ml-60 min-h-screen flex flex-col">{children}</div>
    </div>
  );
}
