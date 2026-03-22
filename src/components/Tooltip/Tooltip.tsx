import React, { useEffect, useState } from "react";
import styles from "./Tooltip.module.css";
import { cx } from "../shared";

export type TooltipPlacement = "top" | "bottom" | "left" | "right";

export interface TooltipProps {
  content: React.ReactNode;
  placement?: TooltipPlacement;
  children: React.ReactElement;
}

export function Tooltip({ content, placement = "top", children }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const [currentPlacement, setCurrentPlacement] = useState<TooltipPlacement>(placement);

  useEffect(() => {
    if (!open) return;
    const nearTop = window.scrollY < 40;
    if (placement === "top" && nearTop) setCurrentPlacement("bottom");
    else setCurrentPlacement(placement);
  }, [open, placement]);

  return (
    <span className={styles.wrap} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}>
      {children}
      {open ? <span role="tooltip" className={cx(styles.tip, styles[currentPlacement])}>{content}</span> : null}
    </span>
  );
}
