"use client";

import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectDropdownProps {
  values: string[];
  onChange: (values: string[]) => void;
  options: MultiSelectOption[];
  placeholder?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
}

export function MultiSelectDropdown({
  values,
  onChange,
  options,
  placeholder = "Pilih...",
  style,
  disabled = false,
}: MultiSelectDropdownProps) {
  function toggle(value: string) {
    if (values.includes(value)) {
      onChange(values.filter((v) => v !== value));
    } else {
      onChange([...values, value]);
    }
  }

  function removeChip(value: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    onChange(values.filter((v) => v !== value));
  }

  const selectedOptions = options.filter((o) => values.includes(o.value));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          cursor: disabled ? "not-allowed" : "pointer",
          textAlign: "left",
          fontFamily: "inherit",
          opacity: disabled ? 0.5 : 1,
          minHeight: 46,
          padding: "4px 10px 4px 8px",
          borderRadius: 8,
          background: "#fff",
          border: "1px solid rgba(195,198,215,0.5)",
          width: "100%",
          ...style,
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, flex: 1 }}>
          {selectedOptions.length === 0 && (
            <span style={{ color: "#9CA3AF", fontSize: 14, lineHeight: "30px" }}>{placeholder}</span>
          )}
          {selectedOptions.map((opt) => (
            <span
              key={opt.value}
              style={{
                display: "inline-flex", alignItems: "center", gap: 3,
                background: "#F3F4F6", borderRadius: 6, padding: "2px 6px 2px 8px",
                fontSize: 12, fontWeight: 500, color: "#171717",
              }}
            >
              {opt.label}
              <button
                type="button"
                onMouseDown={(e) => removeChip(opt.value, e)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  padding: 0, display: "flex", alignItems: "center",
                  color: "#9CA3AF", lineHeight: 1,
                }}
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
        <ChevronDown size={14} style={{ flexShrink: 0, opacity: 0.5 }} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-[--radix-dropdown-menu-trigger-width]"
        style={{ maxHeight: 220, overflowY: "auto" }}
      >
        {options.length === 0 && (
          <div style={{ padding: "10px 12px", fontSize: 12, color: "#9CA3AF" }}>
            Tidak ada pilihan
          </div>
        )}
        {options.map((option) => {
          const selected = values.includes(option.value);
          return (
            <DropdownMenuItem
              key={option.value}
              onSelect={(e) => e.preventDefault()}
              onClick={() => toggle(option.value)}
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontWeight: selected ? 600 : 400,
              }}
            >
              <span
                style={{
                  width: 15, height: 15, borderRadius: 4, flexShrink: 0,
                  border: `1.5px solid ${selected ? "#DA0037" : "#D1D5DB"}`,
                  background: selected ? "#DA0037" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                {selected && <Check size={9} color="white" strokeWidth={3} />}
              </span>
              <span style={{ color: selected ? "#DA0037" : "#171717" }}>{option.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
