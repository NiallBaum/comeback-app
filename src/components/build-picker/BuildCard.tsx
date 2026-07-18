"use client"

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ClipboardIcon, ClipboardCheckIcon } from "lucide-react";
import type { BuildRecommendation } from "@/types";
import { Card, CardHeader, CardTitle, CardAction, CardContent, CardFooter } from "@/components/ui/card";
import { motion } from "framer-motion"

interface BuildCardProps {
  build: BuildRecommendation;
}

export function BuildCard({ build }: BuildCardProps) {
  const isDataBacked = build.confidence === "data-backed";
  const [copied, setCopied] = useState(false);
  const copiedTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    return () => clearTimeout(copiedTimeout.current);
  }, []);

  async function handleCopyPob() {
    if (!build.pobCode) return;
    await navigator.clipboard.writeText(build.pobCode);
    setCopied(true);
    clearTimeout(copiedTimeout.current);
    copiedTimeout.current = setTimeout(() => setCopied(false), 2000);
  }

  const listVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.05 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 4 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <Card className="transition-shadow hover:shadow-lg hover:ring-foreground/20">
      <CardHeader>
        <CardTitle>{build.label}</CardTitle>
        <CardAction>
          <span
            className={`
              font-mono uppercase rounded-full px-2 py-0.5 text-[9px] font-medium 
              ${isDataBacked
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
              }
            `}
          >
            {build.confidence.replace("-", " ")}
          </span>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <motion.ul 
          className="flex flex-wrap gap-1.5"
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          {build.items.map((item, index) => (
            <motion.li
              key={`${item.name}-${index}`}
              variants={itemVariants}
              className="flex items-center gap-1.5 rounded-full border border-border bg-muted py-1 pr-3 pl-1 text-xs font-medium"
            >
              {item.iconUrl && (
                <img src={item.iconUrl} alt="" className="size-6 rounded-full" />
              )}
              {item.name}
            </motion.li>
          ))}
        </motion.ul>
        <p className="border-t border-border pt-3 text-muted-foreground">
          {build.whyItWorksNow}
        </p>
      </CardContent>
      {build.pobCode && (
        <CardFooter>
          <Button variant="outline" size="sm" onClick={handleCopyPob}>
            {copied ? <ClipboardCheckIcon /> : <ClipboardIcon />}
            <span className="leading-none translate-y-[2px]">{copied ? "Copied" : "Copy PoB Code"}</span>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
