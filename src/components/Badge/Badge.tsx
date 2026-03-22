import React from "react";
import styles from "./Badge.module.css";
import { cx } from "../shared";

export type BadgeVariant = "default" | "success" | "warning" | "error" | "info";
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> { variant?: BadgeVariant; dot?: boolean; }

export function Badge({ variant = "default", dot = false, className, children, ...props }: BadgeProps) {
  return <span {...props} className={cx(styles.badge, styles[variant], dot && styles.dot, className)}>{children}</span>;
}
