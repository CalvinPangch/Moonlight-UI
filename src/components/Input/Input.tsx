import React from "react";
import styles from "./Input.module.css";
import { cx } from "../shared";

interface BaseProps {
  label?: string;
  error?: string;
  helperText?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix">, BaseProps {}
type TextareaBaseProps = Omit<BaseProps, "prefix" | "suffix">;
export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "prefix">, TextareaBaseProps {}

export function Input({ label, error, helperText, prefix, suffix, className, ...props }: InputProps) {
  return (
    <label className={cx(styles.field, error && styles.error, className)}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <span className={styles.control}>
        {prefix ? <span className={styles.icon}>{prefix}</span> : null}
        <input {...props} className={styles.input} />
        {suffix ? <span className={styles.icon}>{suffix}</span> : null}
      </span>
      {(error || helperText) ? <span className={cx(styles.helper, error && styles.errorText)}>{error ?? helperText}</span> : null}
    </label>
  );
}

export function Textarea({ label, error, helperText, className, ...props }: TextareaProps) {
  return (
    <label className={cx(styles.field, error && styles.error, className)}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <span className={styles.control}><textarea {...props} className={styles.textarea} /></span>
      {(error || helperText) ? <span className={cx(styles.helper, error && styles.errorText)}>{error ?? helperText}</span> : null}
    </label>
  );
}
