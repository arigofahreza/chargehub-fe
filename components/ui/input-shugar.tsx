"use client";

import React, { forwardRef, useRef } from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

interface InputShugarProps {
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  prefixStyling?: string;
  suffixStyling?: string;
  placeholder?: string;
  onFocus?: () => void;
  value?: string;
  onChange?: (value: string) => void;
  wrapperClassName?: string;
  className?: string;
  type?: string;
  disabled?: boolean;
  onBlur?: () => void;
}

export const Input = forwardRef<HTMLInputElement, InputShugarProps>(
  (
    {
      prefix,
      suffix,
      prefixStyling,
      suffixStyling,
      placeholder,
      onFocus,
      value,
      onChange,
      wrapperClassName,
      className,
      type = "text",
      disabled,
      onBlur,
    },
    ref
  ) => {
    const innerRef = useRef<HTMLInputElement>(null);
    const inputRef = (ref ?? innerRef) as React.RefObject<HTMLInputElement>;

    return (
      <div
        className={twMerge(
          clsx(
            "relative flex items-center h-10 rounded-lg border border-gray-alpha-300 bg-background-100 shadow-border-small overflow-hidden",
            wrapperClassName
          )
        )}
      >
        {prefix && (
          <div
            className={clsx(
              "flex items-center justify-center shrink-0 pl-2.5 pr-1 text-gray-700",
              prefixStyling
            )}
          >
            {prefix}
          </div>
        )}
        <input
          ref={inputRef}
          type={type}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={onFocus}
          onBlur={onBlur}
          onChange={(e) => onChange?.(e.target.value)}
          className={twMerge(
            clsx(
              "flex-1 h-full bg-transparent text-sm text-gray-1000 placeholder:text-gray-700 outline-none border-none px-2",
              className
            )
          )}
        />
        {suffix && (
          <div
            className={clsx(
              "flex items-center justify-center shrink-0 pr-2.5 pl-1 text-gray-700",
              suffixStyling
            )}
          >
            {suffix}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "InputShugar";
