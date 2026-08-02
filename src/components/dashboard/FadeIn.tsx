"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  // Changing this key is what triggers the animation - React treats a key
  // change as a brand-new element, unmounts the old one, and replays
  // initial -> animate on the fresh mount. Without a key tied to the real
  // state (which hero, success vs. failure), this would only ever play once.
  transitionKey: string;
}

export function FadeIn({ children, transitionKey }: FadeInProps) {
  return (
    <motion.div
      key={transitionKey}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
