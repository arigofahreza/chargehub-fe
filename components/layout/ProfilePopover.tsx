"use client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function ProfilePopover() {
  const router = useRouter();

  return (
    <Popover>
      <PopoverTrigger
        className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-[#F8F9FF] transition-colors border-0 bg-transparent cursor-pointer"
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src="/assets/avatar-user.jpg" alt="User" />
          <AvatarFallback
            className="text-white text-xs font-semibold"
            style={{ backgroundColor: "var(--color-brand-primary)" }}
          >
            JW
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-semibold" style={{ color: "var(--color-ink)" }}>
          James Wilson
        </span>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-48 p-2"
        style={{
          boxShadow: "var(--shadow-float)",
          borderRadius: "var(--radius-card)",
        }}
      >
        <div className="px-2 py-1">
          <p className="text-sm font-semibold" style={{ color: "var(--color-ink)" }}>
            James Wilson
          </p>
          <p className="text-xs" style={{ color: "var(--color-muted-text)" }}>
            Fleet Manager
          </p>
        </div>
        <Separator className="my-1" />
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-xs"
          style={{ color: "var(--color-error)" }}
          onClick={() => router.push("/login")}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </PopoverContent>
    </Popover>
  );
}
