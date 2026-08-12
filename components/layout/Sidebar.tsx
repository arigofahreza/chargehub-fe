"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Car,
  Users,
  Bell,
  ClipboardList,
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";

const allNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
  { href: "/vehicles", label: "Vehicles", icon: Car, adminOnly: false },
  { href: "/employees", label: "Employees", icon: Users, adminOnly: true },
  { href: "/notifications", label: "Notifications", icon: Bell, adminOnly: true },
  { href: "/activity", label: "Activity", icon: ClipboardList, adminOnly: false },
];

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "admin";
  const navItems = allNavItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <aside
      className="hidden md:flex fixed left-0 top-0 h-screen w-60 bg-white flex-col z-30"
      style={{ borderRight: "1px solid var(--color-border-ch)" }}
    >
      {/* Logo */}
      <div
        className="flex items-center px-5"
        style={{ height: 72, flexShrink: 0, borderBottom: "1px solid var(--color-border-ch)" }}
      >
        <Image
          src="/assets/logo-chargehub.png"
          alt="ChargeHub"
          width={140}
          height={32}
          className="object-contain"
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "" : "hover:bg-[#F8F9FF]"
              )}
              style={{
                borderRadius: "var(--radius-input)",
                backgroundColor: active ? "rgba(0,74,198,0.08)" : undefined,
                color: active
                  ? "var(--color-brand-primary)"
                  : "var(--color-body)",
              }}
            >
              <Icon
                className="h-5 w-5"
                style={{
                  color: active
                    ? "var(--color-brand-primary)"
                    : "var(--color-muted-text)",
                }}
              />
              {label}
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}
