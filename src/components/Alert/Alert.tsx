import React, { useState } from "react";
import styles from "./Alert.module.css";
import { cx } from "../shared";

export type AlertVariant = "info" | "success" | "warning" | "error";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  dismissible?: boolean;
}

export function Alert({ variant = "info", dismissible = false, className, children, ...props }: AlertProps) {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div {...props} className={cx(styles.alert, styles[variant], className)} role="alert">
      <div>{children}</div>
      {dismissible ? <button className={styles.close} type="button" onClick={() => setOpen(false)} aria-label="Dismiss">×</button> : null}
    </div>
  );
}
