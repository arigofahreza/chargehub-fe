"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserCircle, LogOut } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuthStore } from "@/stores/useAuthStore";
import { getRoleLabel } from "@/lib/rbac";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

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
  const router = useRouter();
  const perms = usePermissions();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [profileOpen, setProfileOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const tabs = allTabs.filter((tab) => !tab.managementOnly || perms.canAccessManagement);

  const initials = user?.fullName
    ? user.fullName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : user?.username?.slice(0, 2).toUpperCase() ?? "U";

  function handleLogout() {
    setProfileOpen(false);
    logout();
    router.push("/login");
  }

  // Close popup on outside click
  useEffect(() => {
    if (!profileOpen) return;
    function onDown(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [profileOpen]);

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
      <div ref={popupRef} style={{ position: "relative" }}>
        {/* Profile popup */}
        <AnimatePresence>
          {profileOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              style={{
                position: "absolute",
                bottom: "calc(100% + 12px)",
                right: 0,
                width: 200,
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 12px 40px rgba(11,28,48,0.18)",
                padding: "10px 8px",
                zIndex: 50,
                pointerEvents: "auto",
              }}
            >
              {/* User info */}
              <div style={{ padding: "4px 8px 8px" }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "var(--color-ink)", margin: 0 }}>
                  {user?.fullName || user?.username || "User"}
                </p>
                <p style={{ fontSize: 11, color: "var(--color-muted-text)", margin: 0 }}>
                  {getRoleLabel(user?.role)}
                </p>
              </div>
              <Separator />
              <Link
                href="/profile"
                onClick={() => setProfileOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--color-body)",
                  textDecoration: "none",
                  marginTop: 4,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#EDEDED")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <UserCircle size={16} style={{ color: "var(--color-muted-text)" }} />
                Profil Saya
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--color-error)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  width: "100%",
                  fontFamily: "inherit",
                  marginTop: 2,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#FEF2F2")}
                onMouseLeave={e => (e.currentTarget.style.background = "none")}
              >
                <LogOut size={16} />
                Keluar
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main pill tab bar */}
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
                onClick={() => setProfileOpen(false)}
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

          {/* Profile avatar button */}
          <button
            onClick={() => setProfileOpen((v) => !v)}
            aria-label="Profil"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 9999,
              padding: "4px 10px",
              position: "relative",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: pathname === "/profile" ? "#DA0037" : "#777777",
            }}
          >
            {(pathname === "/profile" || profileOpen) && (
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
            <span style={{ position: "relative", zIndex: 1 }}>
              <Avatar style={{
                width: 26, height: 26,
                border: `2px solid ${pathname === "/profile" || profileOpen ? "#DA0037" : "transparent"}`,
                transition: "border-color 0.15s ease",
              }}>
                <AvatarImage src="/assets/avatar-user.jpg" alt="User" />
                <AvatarFallback style={{
                  fontSize: 10, fontWeight: 700, background: "#DA0037", color: "#fff",
                }}>
                  {initials}
                </AvatarFallback>
              </Avatar>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
