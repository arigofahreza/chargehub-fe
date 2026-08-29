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
  UserCircle,
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

const allNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
  { href: "/vehicles", label: "Vehicles", icon: Car, adminOnly: false },
  { href: "/employees", label: "Employees", icon: Users, adminOnly: true },
  { href: "/notifications", label: "Notifications", icon: Bell, adminOnly: true },
  { href: "/activity", label: "Activity", icon: ClipboardList, adminOnly: false },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isAdmin = user?.role === "admin";
  const navItems = allNavItems.filter((item) => !item.adminOnly || isAdmin);

  const initials = user?.fullName
    ? user.fullName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : user?.username?.slice(0, 2).toUpperCase() ?? "U";

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <aside
      className="hidden md:flex fixed left-0 top-0 h-screen w-60 bg-white flex-col z-30"
      style={{ borderRight: "1px solid var(--color-border-ch)" }}
    >
      {/* Logo */}
      <div className="flex items-center justify-center gap-2.5 px-5" style={{ height: 72, flexShrink: 0, paddingTop: 16 }}>
        <Image
          src="/assets/amm.png"
          alt="AMEV"
          width={40}
          height={40}
          className="object-contain flex-shrink-0"
        />
        <span style={{ fontSize: 22, fontWeight: 800, color: "var(--color-ink)", letterSpacing: "-0.5px" }}>
          AMEV
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pt-7 pb-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center justify-center py-2.5 text-sm font-medium transition-colors",
                active ? "" : "hover:bg-[#EDEDED]"
              )}
              style={{
                borderRadius: "var(--radius-input)",
                backgroundColor: active ? "rgba(218,0,55,0.08)" : undefined,
                color: active ? "var(--color-brand-primary)" : "var(--color-body)",
              }}
            >
              <span className="flex items-center gap-3 w-36">
                <Icon
                  className="h-5 w-5 flex-shrink-0"
                  style={{ color: active ? "var(--color-brand-primary)" : "var(--color-muted-text)" }}
                />
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* User avatar at bottom */}
      <div className="px-3 pb-4 flex-shrink-0" style={{ borderTop: "1px solid var(--color-border-ch)" }}>
        <Popover>
          <PopoverTrigger
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#EDEDED] transition-colors text-left"
            style={{ border: "none", background: "none", cursor: "pointer", fontFamily: "inherit" }}
          >
            <Avatar className="h-8 w-8 flex-shrink-0" style={{ border: "2px solid var(--color-brand-primary)" }}>
              <AvatarImage src="/assets/avatar-user.jpg" alt="User" />
              <AvatarFallback
                className="text-white text-xs font-semibold"
                style={{ backgroundColor: "var(--color-brand-primary)" }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: "var(--color-ink)" }}>
                {user?.fullName || user?.username || "User"}
              </p>
              <p className="text-xs truncate" style={{ color: "var(--color-muted-text)" }}>
                {user?.role === "admin" ? "Admin" : "Operator"}
              </p>
            </div>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="start"
            className="w-52 p-2"
            style={{ boxShadow: "var(--shadow-float)", borderRadius: "var(--radius-card)" }}
          >
            <div className="px-2 py-1">
              <p className="text-sm font-semibold" style={{ color: "var(--color-ink)" }}>
                {user?.fullName || user?.username || "User"}
              </p>
              <p className="text-xs" style={{ color: "var(--color-muted-text)" }}>
                {user?.role === "admin" ? "Admin" : "Operator"}
              </p>
            </div>
            <Separator className="my-1" />
            <Link
              href="/profile"
              className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-medium rounded-md hover:bg-[#EDEDED] transition-colors"
              style={{ color: "var(--color-body)" }}
            >
              <UserCircle className="h-4 w-4" style={{ color: "var(--color-muted-text)" }} />
              My Profile
            </Link>
            <Separator className="my-1" />
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-medium rounded-md hover:bg-red-50 transition-colors"
              style={{ color: "var(--color-error)", border: "none", background: "none", cursor: "pointer", fontFamily: "inherit" }}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </PopoverContent>
        </Popover>
      </div>
    </aside>
  );
}
