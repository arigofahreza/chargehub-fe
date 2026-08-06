"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Car,
  Users,
  Bell,
  ClipboardList,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vehicles", label: "Vehicles", icon: Car },
  { href: "/employees", label: "Employees", icon: Users },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/activity", label: "Activity", icon: ClipboardList },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-60 bg-white flex flex-col z-30"
      style={{ borderRight: "1px solid var(--color-border-ch)" }}
    >
      {/* Logo */}
      <div
        className="h-16 flex items-center px-5"
        style={{ borderBottom: "1px solid var(--color-border-ch)" }}
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

      {/* Logout */}
      <div
        className="px-3 pb-4 pt-3"
        style={{ borderTop: "1px solid var(--color-border-ch)" }}
      >
        <button
          onClick={() => router.push("/login")}
          className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium w-full transition-colors hover:bg-[#F8F9FF]"
          style={{
            borderRadius: "var(--radius-input)",
            color: "var(--color-muted-text)",
          }}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
