"use client";

import * as React from "react";
import { format } from "date-fns";
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
  background: "#EFF4FF",
  border: "1px solid #C3C6D7",
  padding: "0 8px",
  fontSize: 13,
  fontFamily: "inherit",
  color: "#0B1C30",
  outline: "none",
  cursor: "pointer",
};

export function DateTimePicker({ value, onChange }: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(value ?? undefined);
  const [hour, setHour] = React.useState("12");
  const [minute, setMinute] = React.useState("00");
  const [ampm, setAmpm] = React.useState("AM");
  const [dropdownPos, setDropdownPos] = React.useState({ top: 0, left: 0 });

  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Sync incoming value → internal state
  React.useEffect(() => {
    if (value) {
      setDate(value);
      const h = value.getHours();
      setAmpm(h >= 12 ? "PM" : "AM");
      const h12 = h % 12 || 12;
      setHour(h12.toString().padStart(2, "0"));
      setMinute(value.getMinutes().toString().padStart(2, "0"));
    } else {
      setDate(undefined);
    }
  }, [value]);

  // Close on outside click
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
    (d: Date | undefined, h: string, m: string, ap: string) => {
      if (!d) { onChange(null); return; }
      const result = new Date(d);
      let hour24 = parseInt(h);
      if (ap === "PM" && hour24 < 12) hour24 += 12;
      if (ap === "AM" && hour24 === 12) hour24 = 0;
      result.setHours(hour24, parseInt(m), 0, 0);
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
    combine(d, hour, minute, ampm);
  };

  const handleHour = (h: string) => { setHour(h); combine(date, h, minute, ampm); };
  const handleMinute = (m: string) => { setMinute(m); combine(date, hour, m, ampm); };
  const handleAmpm = (ap: string) => { setAmpm(ap); combine(date, hour, minute, ap); };

  const displayLabel = date
    ? `${format(date, "EEE, MMM d")} · ${hour}:${minute} ${ampm}`
    : "Select date & time";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Date trigger */}
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
          background: "#EFF4FF",
          border: isOpen ? "1px solid #004AC6" : "1px solid #C3C6D7",
          padding: "0 12px",
          fontSize: 14,
          fontFamily: "inherit",
          color: date ? "#0B1C30" : "#737686",
          cursor: "pointer",
          width: "100%",
          textAlign: "left",
          transition: "border-color 0.15s",
          outline: "none",
        }}
      >
        <CalendarIcon size={14} style={{ flexShrink: 0, color: "#737686" }} />
        <span style={{ flex: 1 }}>{displayLabel}</span>
      </button>

      {/* Calendar dropdown portal */}
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

      {/* Time selects — always visible */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Clock size={14} style={{ color: "#737686", flexShrink: 0 }} />
        <select value={hour} onChange={(e) => handleHour(e.target.value)} style={timeSelectStyle}>
          {Array.from({ length: 12 }, (_, i) => {
            const h = (i + 1).toString().padStart(2, "0");
            return <option key={h} value={h}>{h}</option>;
          })}
        </select>
        <span style={{ fontSize: 14, color: "#737686", fontWeight: 600 }}>:</span>
        <select value={minute} onChange={(e) => handleMinute(e.target.value)} style={timeSelectStyle}>
          {["00", "15", "30", "45"].map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <select value={ampm} onChange={(e) => handleAmpm(e.target.value)} style={timeSelectStyle}>
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    </div>
  );
}
