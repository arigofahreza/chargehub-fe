import { ProfilePopover } from "./ProfilePopover";

interface TopBarProps {
  title: string;
}

export function TopBar({ title }: TopBarProps) {
  return (
    <header
      className="h-16 bg-white flex items-center justify-between px-6 sticky top-0 z-20"
      style={{ borderBottom: "1px solid var(--color-border-ch)" }}
    >
      <h1
        className="text-lg font-extrabold tracking-tight"
        style={{ color: "var(--color-ink)" }}
      >
        {title}
      </h1>
      <ProfilePopover />
    </header>
  );
}
