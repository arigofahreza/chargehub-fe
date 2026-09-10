"use client";

import {
  addDays,
  addMonths,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isEqual,
  isSameDay,
  isSameMonth,
  isToday,
  isWithinInterval,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import { enUS } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { useClickOutside } from "@/components/ui/use-click-outside";

export interface RangeValue {
  start: Date;
  end: Date;
}


const ClockIcon = () => (
  <svg height="14" viewBox="0 0 16 16" width="14" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="8" cy="8" r="7" stroke="#777777" strokeWidth="1.5" />
    <path d="M8 5V8.5L10 10" stroke="#777777" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const ArrowBottomIcon = ({ open }: { open?: boolean }) => (
  <svg
    height="14"
    viewBox="0 0 16 16"
    width="14"
    fill="none"
    style={{
      flexShrink: 0,
      transition: "transform 0.2s",
      transform: open ? "rotate(180deg)" : "rotate(0deg)",
    }}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M14.0607 5.5L13.5303 6.03L8.707 10.854C8.317 11.244 7.683 11.244 7.293 10.854L2.47 6.03L1.94 5.5L3 4.44L3.53 4.97L8 9.44L12.47 4.97L13 4.44L14.06 5.5Z"
      fill="#777777"
    />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg height="14" viewBox="0 0 16 16" width="14" fill="none">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10.5 14.06L9.97 13.53L5.146 8.707C4.756 8.317 4.756 7.683 5.146 7.293L9.97 2.47L10.5 1.94L11.56 3L11.03 3.53L6.56 8L11.03 12.47L11.56 13L10.5 14.06Z"
      fill="#777777"
    />
  </svg>
);

const ArrowRightIcon = () => (
  <svg height="14" viewBox="0 0 16 16" width="14" fill="none">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.5 1.94L6.03 2.47L10.854 7.293C11.244 7.683 11.244 8.317 10.854 8.707L6.03 13.53L5.5 14.06L4.44 13L4.97 12.47L9.44 8L4.97 3.53L4.44 3L5.5 1.94Z"
      fill="#777777"
    />
  </svg>
);

const CalendarIcon = () => (
  <svg height="14" viewBox="0 0 16 16" width="14" fill="none" style={{ flexShrink: 0 }}>
    <rect x="1.5" y="3" width="13" height="12" rx="2" stroke="#777777" strokeWidth="1.5" />
    <path d="M1.5 6.5H14.5" stroke="#777777" strokeWidth="1.5" />
    <path d="M5.5 1V4M10.5 1V4" stroke="#777777" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const ClearIcon = () => (
  <svg height="12" viewBox="0 0 16 16" width="12">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12.47 13.53L13 14.06L14.06 13L13.53 12.47L9.06 8L13.53 3.53L14.06 3L13 1.94L12.47 2.47L8 6.94L3.53 2.47L3 1.94L1.94 3L2.47 3.53L6.94 8L2.47 12.47L1.94 13L3 14.06L3.53 13.53L8 9.06L12.47 13.53Z"
      fill="#777777"
    />
  </svg>
);


const filterPresets = (
  obj: Record<string, { text: string; start: Date; end: Date }>,
  search: string
) => {
  if (!search) return obj;
  const words = search.toLowerCase().split(/[-\s]+/).filter(Boolean);
  const filtered = Object.fromEntries(
    Object.entries(obj).filter(([, v]) =>
      words.every((w) => v.text.toLowerCase().includes(w))
    )
  );
  if (Object.keys(filtered).length > 0) return filtered;

  const n = parseInt((search.match(/\d+/) || [])[0] || "0", 10);
  if (!n) return {};
  const now = new Date();
  return {
    [`last-${n}-days`]: { text: `Last ${n} Days`, start: startOfDay(subDays(now, n)), end: endOfDay(now) },
    [`last-${n}-weeks`]: { text: `Last ${n} Weeks`, start: startOfDay(subWeeks(now, n)), end: endOfDay(now) },
    [`last-${n}-months`]: { text: `Last ${n} Months`, start: startOfDay(subMonths(now, n)), end: endOfDay(now) },
  };
};

const formatDateRange = (start: Date, end: Date, timezone: string) => {
  const isStartMidnight = isEqual(start, startOfDay(start));
  const isEndEOD = isEqual(end, endOfDay(end));
  const sameDay = isSameDay(start, end);

  const fmt = (d: Date, f: string) => formatInTimeZone(d, timezone, f);

  if (sameDay) {
    return fmt(start, isStartMidnight ? "EEE, MMM d" : "EEE, MMM d, HH:mm");
  }

  const startHasTime = !isStartMidnight;
  const endHasTime = !isEndEOD;
  if (startHasTime || endHasTime) {
    return `${fmt(start, startHasTime ? "MMM d, HH:mm" : "MMM d")} - ${fmt(end, endHasTime ? "MMM d, HH:mm" : "MMM d")}`;
  }

  const sameMonth = fmt(start, "MMM-yy") === fmt(end, "MMM-yy");
  const sameYear = fmt(start, "yy") === fmt(end, "yy");

  if (sameMonth) return `${fmt(start, "MMM d")} - ${fmt(end, "d")}`;
  if (sameYear) return `${fmt(start, "MMM d")} - ${fmt(end, "MMM d")}`;
  return `${fmt(start, "MMM d ''yy")} - ${fmt(end, "MMM d ''yy")}`;
};

const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;


interface CalendarComboboxProps {
  value: RangeValue | null;
  onChange: (v: RangeValue | null) => void;
  presets: Record<string, { text: string; start: Date; end: Date }>;
  presetIndex?: number;
}

const CalendarCombobox = ({ value, onChange, presets, presetIndex }: CalendarComboboxProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [currentPreset, setCurrentPreset] = useState<{ text: string; start: Date; end: Date } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setIsOpen(false));

  useEffect(() => {
    const arr = Object.entries(presets);
    if (presetIndex !== undefined && presetIndex >= 0 && presetIndex < arr.length) {
      const preset = arr[presetIndex][1];
      setInputValue(preset.text);
      setCurrentPreset(preset);
      onChange({ start: preset.start, end: preset.end });
    }
  }, [presetIndex]);

  useEffect(() => {
    if (currentPreset && (currentPreset.start !== value?.start || currentPreset.end !== value?.end)) {
      setCurrentPreset(null);
      setInputValue("");
    }
  }, [value]);

  const filteredPresets = filterPresets(presets, inputValue);

  const clickPreset = (preset: { text: string; start: Date; end: Date }) => {
    setInputValue(preset.text);
    setCurrentPreset(preset);
    onChange({ start: preset.start, end: preset.end });
    setIsOpen(false);
  };

  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      {/* Input trigger */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          height: 36,
          borderRadius: 8,
          border: "1px solid rgba(195,198,215,0.5)",
          background: "#EDEDED",
          padding: "0 8px 0 10px",
          cursor: "text",
        }}
      >
        <ClockIcon />
        <input
          value={inputValue}
          placeholder="Select period"
          onFocus={() => setIsOpen(true)}
          onChange={(e) => setInputValue(e.target.value)}
          style={{
            flex: 1,
            border: "none",
            background: "transparent",
            outline: "none",
            fontSize: 12,
            color: "#171717",
            fontFamily: "inherit",
          }}
        />
        <ArrowBottomIcon open={isOpen} />
      </div>

      {/* Preset list */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            zIndex: 60,
            top: 42,
            left: 0,
            right: 0,
            background: "#fff",
            border: "1px solid rgba(195,198,215,0.5)",
            borderRadius: 10,
            boxShadow: "0 4px 12px rgba(11,28,48,0.12)",
            paddingTop: 4,
            paddingBottom: 4,
            maxHeight: 220,
            overflowY: "auto",
          }}
        >
          {Object.entries(filteredPresets).length > 0 ? (
            Object.entries(filteredPresets).map(([key, preset]) => (
              <div
                key={key}
                onClick={() => clickPreset(preset)}
                style={{
                  padding: "8px 12px",
                  fontSize: 12,
                  color: "#171717",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  borderRadius: 6,
                  margin: "0 4px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#EDEDED")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {preset.text}
              </div>
            ))
          ) : (
            <div style={{ padding: "8px 12px", fontSize: 12, color: "#777777", fontFamily: "inherit" }}>
              No matches
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// â”€â”€â”€ CalendarGrid â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface CalendarGridProps {
  currentMonth: Date;
  value: RangeValue | null;
  hoverDate: Date | null;
  onDateClick: (date: Date) => void;
  onDateHover: (date: Date | null) => void;
}

const CalendarGrid = ({
  currentMonth,
  value,
  hoverDate,
  onDateClick,
  onDateHover,
}: CalendarGridProps) => {
  const start = startOfWeek(startOfMonth(currentMonth), { locale: enUS });
  const end = endOfWeek(endOfMonth(currentMonth), { locale: enUS });

  const days: Date[] = [];
  let d = start;
  while (d <= end) {
    days.push(d);
    d = addDays(d, 1);
  }

  const isInRange = (date: Date) => {
    if (!value?.start) return false;
    const rangeEnd = hoverDate && !value.end ? hoverDate : value.end;
    if (!rangeEnd) return false;
    const [s, e] = value.start <= rangeEnd ? [value.start, rangeEnd] : [rangeEnd, value.start];
    return isWithinInterval(date, { start: startOfDay(s), end: endOfDay(e) });
  };

  const isRangeStart = (date: Date) =>
    value?.start ? isSameDay(date, value.start) : false;

  const isRangeEnd = (date: Date) => {
    if (!value?.start) return false;
    const end = value.end ?? hoverDate;
    return end ? isSameDay(date, end) : false;
  };

  const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div style={{ width: "100%", userSelect: "none" }}>
      {/* Weekday headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 }}>
        {weekdays.map((w) => (
          <div
            key={w}
            style={{
              textAlign: "center",
              fontSize: 11,
              fontWeight: 600,
              color: "#777777",
              padding: "4px 0",
              fontFamily: "inherit",
            }}
          >
            {w}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
        {days.map((day, i) => {
          const inMonth = isSameMonth(day, currentMonth);
          const today = isToday(day);
          const rangeStart = isRangeStart(day);
          const rangeEnd = isRangeEnd(day);
          const inRange = isInRange(day);
          const isSelected = rangeStart || rangeEnd;

          return (
            <div
              key={i}
              onClick={() => inMonth && onDateClick(day)}
              onMouseEnter={() => onDateHover(day)}
              onMouseLeave={() => onDateHover(null)}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 32,
                cursor: inMonth ? "pointer" : "default",
                background: inRange && !isSelected ? "#EDEDED" : "transparent",
                borderRadius: isSelected
                  ? "50%"
                  : rangeStart
                  ? "50% 0 0 50%"
                  : rangeEnd
                  ? "0 50% 50% 0"
                  : inRange
                  ? 0
                  : "50%",
                transition: "background 0.1s",
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  fontSize: 12,
                  fontFamily: "inherit",
                  fontWeight: isSelected || today ? 600 : 400,
                  color: isSelected
                    ? "#fff"
                    : !inMonth
                    ? "rgba(11,28,48,0.25)"
                    : "#171717",
                  background: isSelected ? "#DA0037" : "transparent",
                  transition: "background 0.1s, color 0.1s",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected && inMonth) {
                    (e.currentTarget as HTMLElement).style.background = "#EDEDED";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }
                }}
              >
                {format(day, "d")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// â”€â”€â”€ Main Calendar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface CalendarProps {
  value: RangeValue | null;
  onChange: (v: RangeValue | null) => void;
  presets?: Record<string, { text: string; start: Date; end: Date }>;
  showTimeInput?: boolean;
  showTimezone?: boolean;
  fullWidth?: boolean;
  singleDateMode?: boolean;
}

export const Calendar = ({
  value,
  onChange,
  presets = {},
  showTimeInput = true,
  showTimezone = false,
  fullWidth = false,
  singleDateMode = false,
}: CalendarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [selecting, setSelecting] = useState<"start" | "end" | null>(null);
  const [timezone] = useState(localTimezone);
  const [pendingValue, setPendingValue] = useState<RangeValue | null>(value);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        ref.current && !ref.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  const displayLabel = useMemo(() => {
    if (!value?.start) return singleDateMode ? "Select date" : "Select date range";
    if (!value.end || isSameDay(value.start, value.end)) {
      return formatDateRange(value.start, value.start, timezone);
    }
    return formatDateRange(value.start, value.end, timezone);
  }, [value, timezone, singleDateMode]);

  const handleDateClick = (date: Date) => {
    if (singleDateMode) {
      const v = { start: startOfDay(date), end: endOfDay(date) };
      onChange(v);
      setIsOpen(false);
      return;
    }
    if (!selecting || selecting === "start") {
      setPendingValue({ start: startOfDay(date), end: endOfDay(date) });
      setSelecting("end");
    } else {
      if (!pendingValue?.start) return;
      const [s, e] =
        date >= pendingValue.start
          ? [pendingValue.start, endOfDay(date)]
          : [startOfDay(date), endOfDay(pendingValue.start)];
      setPendingValue({ start: s, end: e });
      setSelecting(null);
    }
  };

  const handleApply = () => {
    if (pendingValue) onChange(pendingValue);
    setIsOpen(false);
    setSelecting(null);
  };

  const handleClear = () => {
    onChange(null);
    setPendingValue(null);
    setSelecting(null);
  };

  const handlePresetChange = (v: RangeValue | null) => {
    setPendingValue(v);
    if (v) onChange(v);
    setIsOpen(false);
  };

  const toggleOpen = () => {
    if (!isOpen) {
      setPendingValue(value);
      setSelecting(null);
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const dropdownWidth = 310;
        const margin = 8;
        const left = rect.left + dropdownWidth > window.innerWidth - margin
          ? Math.max(margin, rect.right - dropdownWidth)
          : rect.left;
        setDropdownPos({ top: rect.bottom + 4, left });
      }
    }
    setIsOpen((o) => !o);
  };

  return (
    <div ref={ref} style={{ position: "relative", display: fullWidth ? "block" : "inline-block", width: fullWidth ? "100%" : undefined, fontFamily: "inherit" }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={toggleOpen}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          height: 38,
          width: fullWidth ? "100%" : undefined,
          paddingLeft: 10,
          paddingRight: 10,
          borderRadius: 8,
          border: isOpen ? "1px solid #DA0037" : "1px solid #DEDEDE",
          background: "#fff",
          color: "#171717",
          fontSize: 13,
          fontFamily: "inherit",
          cursor: "pointer",
          whiteSpace: "nowrap",
          transition: "border-color 0.15s",
          outline: "none",
        }}
      >
        <CalendarIcon />
        <span>{displayLabel}</span>
        {value && (
          <span
            style={{ marginLeft: 2, display: "flex", alignItems: "center", opacity: 0.6 }}
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
          >
            <ClearIcon />
          </span>
        )}
        <ArrowBottomIcon open={isOpen} />
      </button>

      {/* Dropdown â€” portal to escape modal transform context */}
      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: "fixed",
            zIndex: 9999,
            top: dropdownPos.top,
            left: dropdownPos.left,
            padding: 16,
            minWidth: 290,
            background: "#fff",
            border: "1px solid rgba(195,198,215,0.5)",
            borderRadius: 14,
            boxShadow: "0 10px 30px rgba(11,28,48,0.15)",
          }}
        >
          {/* Presets combobox */}
          {Object.keys(presets).length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <CalendarCombobox
                value={pendingValue}
                onChange={handlePresetChange}
                presets={presets}
              />
            </div>
          )}

          {/* Month header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <button
              type="button"
              onClick={() => setCurrentMonth((m) => addMonths(m, -1))}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 28,
                height: 28,
                borderRadius: 6,
                border: "none",
                background: "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#EDEDED")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              <ArrowLeftIcon />
            </button>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#171717", fontFamily: "inherit" }}>
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <button
              type="button"
              onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 28,
                height: 28,
                borderRadius: 6,
                border: "none",
                background: "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#EDEDED")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              <ArrowRightIcon />
            </button>
          </div>

          {/* Calendar grid */}
          <CalendarGrid
            currentMonth={currentMonth}
            value={pendingValue}
            hoverDate={hoverDate}
            onDateClick={handleDateClick}
            onDateHover={setHoverDate}
          />

          {/* Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 14,
              paddingTop: 12,
              borderTop: "1px solid rgba(195,198,215,0.5)",
            }}
          >
            <button
              type="button"
              onClick={handleClear}
              style={{
                background: "none",
                border: "none",
                color: "#777777",
                fontWeight: 500,
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "inherit",
                padding: "5px 10px",
                borderRadius: 6,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#EDEDED")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleApply}
              style={{
                background: "#DA0037",
                border: "none",
                color: "#fff",
                fontWeight: 600,
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "inherit",
                padding: "6px 16px",
                borderRadius: 8,
                height: 30,
              }}
            >
              Apply
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
