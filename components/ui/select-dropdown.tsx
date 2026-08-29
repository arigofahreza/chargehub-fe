"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface SelectDropdownOption {
  value: string;
  label: string;
}

interface SelectDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectDropdownOption[];
  style?: React.CSSProperties;
  className?: string;
  placeholder?: string;
}

export function SelectDropdown({
  value,
  onChange,
  options,
  style,
  className,
  placeholder = "Select...",
}: SelectDropdownProps) {
  const selectedLabel = options.find((o) => o.value === value)?.label ?? placeholder;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={className}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          cursor: "pointer",
          textAlign: "left",
          fontFamily: "inherit",
          ...style,
        }}
      >
        <span
          style={{
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {selectedLabel}
        </span>
        <ChevronDown size={14} style={{ flexShrink: 0, opacity: 0.5 }} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-[--radix-dropdown-menu-trigger-width]"
        style={{ maxHeight: 200, overflowY: "auto" }}
      >
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onChange(option.value)}
            style={{
              cursor: "pointer",
              fontWeight: value === option.value ? 600 : 400,
              color: value === option.value ? "#DA0037" : undefined,
            }}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
