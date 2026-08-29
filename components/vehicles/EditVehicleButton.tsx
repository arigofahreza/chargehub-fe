"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Vehicle } from "@/lib/types";
import { VehicleFormModal } from "@/components/vehicles/VehicleFormModal";

export function EditVehicleButton({ vehicle }: { vehicle: Vehicle }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function handleSubmit() {
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 flex-shrink-0"
        style={{
          background: "none",
          border: "1px solid #DEDEDE",
          borderRadius: 10,
          color: "#DA0037",
          fontSize: 11,
          fontWeight: 600,
          padding: "8px 14px",
          fontFamily: "inherit",
          cursor: "pointer",
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        Edit Vehicle
      </button>
      <VehicleFormModal
        open={open}
        onOpenChange={setOpen}
        mode="edit"
        initial={vehicle}
        onSubmit={handleSubmit}
      />
    </>
  );
}
