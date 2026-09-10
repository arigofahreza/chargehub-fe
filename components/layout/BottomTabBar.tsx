"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { usePermissions } from "@/hooks/usePermissions";

const allTabs = [
  {
    href: "/dashboard",
    label: "Beranda",
    managementOnly: false,
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
    label: "Kendaraan",
    managementOnly: false,
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
    label: "Karyawan",
    managementOnly: false,
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
    label: "Notifikasi",
    managementOnly: false,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M6 10C6 6.5 8.5 4 12 4C15.5 4 18 6.5 18 10V14L20 17H4L6 14V10Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M9 20C9.5 21 10.6 21.7 12 21.7C13.4 21.7 14.5 21 15 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/activity",
    label: "Aktivitas",
    managementOnly: false,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="1.8" />
        <line x1="8" y1="3" x2="8" y2="9" stroke="currentColor" strokeWidth="1.8" />
        <line x1="16" y1="3" x2="16" y2="9" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    href: "/manajemen",
    label: "Manajemen",
    managementOnly: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
];

export function BottomTabBar() {
  const pathname = usePathname();
  const perms = usePermissions();
  const tabs = allTabs.filter((tab) => !tab.managementOnly || perms.canAccessManagement);

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
                position: "relative",
                color: active ? "#DA0037" : "#777777",
                transition: "color 0.15s ease",
              }}
            >
              {active && (
                <motion.div
                  layoutId="bottom-tab-indicator"
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 9999,
                    background: "rgba(218,0,55,0.1)",
                    zIndex: 0,
                  }}
                  transition={{ type: "spring", damping: 35, stiffness: 400 }}
                />
              )}
              <span style={{ position: "relative", zIndex: 1 }}>{icon}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
