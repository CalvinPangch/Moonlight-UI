import React from "react";
import styles from "./Avatar.module.css";
import { cx } from "../shared";

export type AvatarSize = "xs" | "sm" | "md" | "lg";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
}

function initials(name?: string): string {
  if (!name) return "?";
  const [a, b] = name.trim().split(/\s+/);
  return `${a?.[0] ?? ""}${b?.[0] ?? ""}`.toUpperCase();
}

export function Avatar({ src, alt, name, size = "md", className, ...props }: AvatarProps) {
  return <div {...props} className={cx(styles.avatar, styles[size], className)}>{src ? <img className={styles.image} src={src} alt={alt ?? name ?? "avatar"} /> : initials(name)}</div>;
}
