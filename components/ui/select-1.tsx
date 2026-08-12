import React from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  wrapperClassName?: string;
  disabled?: boolean;
}

export const Select = ({
  options,
  value,
  onChange,
  placeholder,
  className,
  wrapperClassName,
  disabled,
}: SelectProps) => (
  <div
    className={twMerge(
      clsx(
        "relative inline-flex items-center h-10 rounded-lg border border-gray-alpha-300 bg-background-100 shadow-border-small overflow-hidden",
        wrapperClassName
      )
    )}
  >
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange?.(e.target.value)}
      className={twMerge(
        clsx(
          "h-full w-full bg-transparent text-sm text-gray-1000 outline-none border-none px-3 pr-8 appearance-none cursor-pointer",
          className
        )
      )}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    <div className="pointer-events-none absolute right-2 flex items-center text-gray-700">
      <svg height="12" viewBox="0 0 16 16" width="12" fill="currentColor">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M14.0607 5.49999L13.5303 6.03032L8.7071 10.8535C8.31658 11.2441 7.68341 11.2441 7.29289 10.8535L2.46966 6.03032L1.93933 5.49999L2.99999 4.43933L3.53032 4.96966L7.99999 9.43933L12.4697 4.96966L13 4.43933L14.0607 5.49999Z"
        />
      </svg>
    </div>
  </div>
);
