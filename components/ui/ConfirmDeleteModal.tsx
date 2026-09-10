"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

interface Props {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDeleteModal({
  open,
  title,
  message = "Tindakan ini tidak dapat dibatalkan.",
  confirmLabel = "Hapus",
  onConfirm,
  onCancel,
}: Props) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onCancel}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.45)",
              zIndex: 9000,
            }}
          />
          <div
            key="modal-wrap"
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 9001,
              maxWidth: 360,
              width: "calc(100vw - 32px)",
            }}
          >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: "28px 24px 20px",
              boxShadow: "0 24px 60px rgba(0,0,0,0.22)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              textAlign: "center",
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "rgba(218,0,55,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#DA0037" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </div>

            {/* Text */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontWeight: 700, fontSize: 16, color: "#171717" }}>{title}</span>
              <span style={{ fontSize: 13, color: "#6B7280", lineHeight: "1.5" }}>{message}</span>
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: 8, width: "100%", marginTop: 4 }}>
              <button
                onClick={onCancel}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 10,
                  background: "#F3F4F6",
                  border: "none",
                  color: "#374151",
                  fontWeight: 600,
                  fontSize: 14,
                  fontFamily: "inherit",
                  cursor: "pointer",
                }}
              >
                Batal
              </button>
              <button
                onClick={onConfirm}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 10,
                  background: "#DA0037",
                  border: "none",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 14,
                  fontFamily: "inherit",
                  cursor: "pointer",
                }}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
