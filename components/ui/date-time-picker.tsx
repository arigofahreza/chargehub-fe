"use client";

import * as React from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CalendarIcon, Clock } from "lucide-react";
import { createPortal } from "react-dom";
import { Calendar } from "@/components/ui/calendar";

interface DateTimePickerProps {
  value?: Date | null;
  onChange: (date: Date | null) => void;
}

const timeSelectStyle: React.CSSProperties = {
  height: 36,
  borderRadius: 8,
  background: "#fff",
  border: "1px solid #DEDEDE",
  padding: "0 8px",
  fontSize: 13,
  fontFamily: "inherit",
  color: "#171717",
  outline: "none",
  cursor: "pointer",
};

export function DateTimePicker({ value, onChange }: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(value ?? undefined);
  const [hour, setHour] = React.useState(() => value ? value.getHours().toString().padStart(2, "0") : "00");
  const [minute, setMinute] = React.useState(() => value ? value.getMinutes().toString().padStart(2, "0") : "00");
  const [dropdownPos, setDropdownPos] = React.useState({ top: 0, left: 0 });

  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (value) {
      setDate(value);
      setHour(value.getHours().toString().padStart(2, "0"));
      setMinute(value.getMinutes().toString().padStart(2, "0"));
    } else {
      setDate(undefined);
    }
  }, [value]);

  React.useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  const combine = React.useCallback(
    (d: Date | undefined, h: string, m: string) => {
      if (!d) { onChange(null); return; }
      const result = new Date(d);
      result.setHours(parseInt(h), parseInt(m), 0, 0);
      onChange(result);
    },
    [onChange],
  );

  const handleToggle = () => {
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const dropdownWidth = 300;
      const margin = 8;
      const left =
        rect.left + dropdownWidth > window.innerWidth - margin
          ? Math.max(margin, rect.right - dropdownWidth)
          : rect.left;
      setDropdownPos({ top: rect.bottom + 4, left });
    }
    setIsOpen((o) => !o);
  };

  const handleDateSelect = (d: Date | undefined) => {
    setDate(d);
    setIsOpen(false);
    combine(d, hour, minute);
  };

  const handleHour = (h: string) => { setHour(h); combine(date, h, minute); };
  const handleMinute = (m: string) => { setMinute(m); combine(date, hour, m); };

  const displayLabel = date
    ? `${format(date, "EEE, d MMM", { locale: id })} - ${hour}:${minute}`
    : "Pilih tanggal & waktu";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          height: 44,
          borderRadius: 10,
          background: "#fff",
          border: isOpen ? "1px solid #DA0037" : "1px solid #DEDEDE",
          padding: "0 12px",
          fontSize: 14,
          fontFamily: "inherit",
          color: date ? "#171717" : "#777777",
          cursor: "pointer",
          width: "100%",
          textAlign: "left",
          transition: "border-color 0.15s",
          outline: "none",
        }}
      >
        <CalendarIcon size={14} style={{ flexShrink: 0, color: "#777777" }} />
        <span style={{ flex: 1 }}>{displayLabel}</span>
      </button>

      {isOpen && typeof window !== "undefined" && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: "fixed",
            zIndex: 9999,
            top: dropdownPos.top,
            left: dropdownPos.left,
            background: "#fff",
            border: "1px solid rgba(195,198,215,0.5)",
            borderRadius: 14,
            boxShadow: "0 10px 30px rgba(11,28,48,0.15)",
            padding: 16,
          }}
        >
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
          />
        </div>,
        document.body,
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Clock size={14} style={{ color: "#777777", flexShrink: 0 }} />
        <select value={hour} onChange={(e) => handleHour(e.target.value)} style={timeSelectStyle}>
          {Array.from({ length: 24 }, (_, i) => {
            const h = i.toString().padStart(2, "0");
            return <option key={h} value={h}>{h}</option>;
          })}
        </select>
        <span style={{ fontSize: 14, color: "#777777", fontWeight: 600 }}>:</span>
        <select value={minute} onChange={(e) => handleMinute(e.target.value)} style={timeSelectStyle}>
          {Array.from({ length: 60 }, (_, i) => {
            const m = i.toString().padStart(2, "0");
            return <option key={m} value={m}>{m}</option>;
          })}
        </select>
      </div>
    </div>
  );
}
