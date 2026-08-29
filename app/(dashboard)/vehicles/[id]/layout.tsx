"use client";
import { motion } from "framer-motion";
import { fadeUpVariants } from "@/lib/motion";

export default function VehicleDetailLayout({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={fadeUpVariants} initial="hidden" animate="visible">
      {children}
    </motion.div>
  );
}
