import React from "react";
import styles from "./Card.module.css";
import { cx } from "../shared";

export type CardVariant = "default" | "elevated" | "bordered";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export function Card({ variant = "default", header, footer, children, className, ...props }: CardProps) {
  return (
    <section className={cx(styles.card, styles[variant], className)} {...props}>
      {header ? <div className={styles.header}>{header}</div> : null}
      <div className={styles.body}>{children}</div>
      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </section>
  );
}
