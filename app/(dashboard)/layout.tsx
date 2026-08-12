import { Sidebar } from "@/components/layout/Sidebar";
import { BottomTabBar } from "@/components/layout/BottomTabBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-page)" }}>
      <Sidebar />
      {/* ml-0 on mobile, ml-60 on desktop; pb-24 on mobile for bottom tab bar clearance */}
      <div className="md:ml-60 min-h-screen flex flex-col pb-24 md:pb-0">
        {children}
      </div>
      <BottomTabBar />
    </div>
  );
}
