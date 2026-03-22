import React from "react";
import styles from "./Spinner.module.css";
import { cx } from "../shared";

export type SpinnerSize = "sm" | "md" | "lg";
export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> { size?: SpinnerSize; }

export function Spinner({ size = "md", className, ...props }: SpinnerProps) {
  return <span {...props} className={cx(styles.spinner, styles[size], className)} aria-label="Loading" />;
}
