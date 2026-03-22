import React from "react";
import styles from "./Button.module.css";
import { cx } from "../shared";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  leftIcon,
  rightIcon,
  fullWidth,
  children,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <button
      {...props}
      className={cx(styles.button, styles[variant], styles[size], fullWidth && styles.fullWidth, isDisabled && styles.disabled, className)}
      disabled={isDisabled}
      aria-disabled={isDisabled}
    >
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      {!loading && leftIcon}
      <span>{children}</span>
      {!loading && rightIcon}
    </button>
  );
}
