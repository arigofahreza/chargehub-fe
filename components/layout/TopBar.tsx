import Image from "next/image";
import { ProfilePopover } from "./ProfilePopover";

export function TopBar() {
  return (
    <header
      className="bg-white sticky top-0 z-20"
      style={{
        height: 72,
        borderBottom: "1px solid var(--color-border-ch)",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        flexShrink: 0,
      }}
    >
      {/* Desktop: profile right only */}
      <div className="hidden md:flex h-full items-center justify-end px-8">
        <ProfilePopover />
      </div>

      {/* Mobile: logo centered + avatar right */}
      <div className="flex md:hidden h-full items-center justify-between px-4">
        <div style={{ width: 36 }} />
        <Image
          src="/assets/logo-chargehub.png"
          alt="ChargeHub"
          width={120}
          height={28}
          className="object-contain"
        />
        <ProfilePopover avatarOnly />
      </div>
    </header>
  );
}
