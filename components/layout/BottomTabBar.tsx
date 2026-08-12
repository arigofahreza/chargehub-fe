"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";

const allTabs = [
  {
    href: "/dashboard",
    label: "Dashboard",
    adminOnly: false,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="9" height="9" rx="2" fill="currentColor" opacity="0.9" />
        <rect x="13" y="2" width="9" height="9" rx="2" fill="currentColor" opacity="0.6" />
        <rect x="2" y="13" width="9" height="9" rx="2" fill="currentColor" opacity="0.6" />
        <rect x="13" y="13" width="9" height="9" rx="2" fill="currentColor" opacity="0.4" />
      </svg>
    ),
  },
  {
    href: "/vehicles",
    label: "Vehicles",
    adminOnly: false,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 20" fill="none">
        <path d="M3 15L5 8H19L21 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="7" cy="17" r="2" fill="currentColor" />
        <circle cx="17" cy="17" r="2" fill="currentColor" />
      </svg>
    ),
  },
  {
    href: "/employees",
    label: "Employees",
    adminOnly: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" />
        <path d="M2 21C2 17.7 5.1 15 9 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M16 15C18.8 15 17.2 21 21 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="16" cy="10" r="3" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    href: "/notifications",
    label: "Notifications",
    adminOnly: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M6 10C6 6.5 8.5 4 12 4C15.5 4 18 6.5 18 10V14L20 17H4L6 14V10Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M9 20C9.5 21 10.6 21.7 12 21.7C13.4 21.7 14.5 21 15 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/activity",
    label: "Activity",
    adminOnly: false,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="1.8" />
        <line x1="8" y1="3" x2="8" y2="9" stroke="currentColor" strokeWidth="1.8" />
        <line x1="16" y1="3" x2="16" y2="9" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
];

export function BottomTabBar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "admin";
  const tabs = allTabs.filter((tab) => !tab.adminOnly || isAdmin);

  return (
    <div
      className="md:hidden"
      style={{
        position: "fixed",
        bottom: 16,
        left: 0,
        right: 0,
        padding: "0 16px",
        zIndex: 30,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          background: "#fff",
          borderRadius: 9999,
          padding: "10px 8px",
          boxShadow: "0 10px 30px rgba(11,28,48,0.18)",
          pointerEvents: "auto",
        }}
      >
        {tabs.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 9999,
                padding: "6px 14px",
                background: active ? "rgba(0,74,198,0.1)" : "transparent",
                color: active ? "#004AC6" : "#737686",
                transition: "all 0.15s ease",
              }}
            >
              {icon}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
