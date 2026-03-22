import React, { useEffect, useRef } from "react";
import styles from "./Modal.module.css";
import { cx } from "../shared";

export type ModalSize = "sm" | "md" | "lg" | "fullscreen";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  size?: ModalSize;
  children: React.ReactNode;
  closeOnBackdrop?: boolean;
}

export function Modal({ isOpen, onClose, size = "md", children, closeOnBackdrop = true }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const container = ref.current;
    const focusables = container?.querySelectorAll<HTMLElement>("button,[href],input,select,textarea,[tabindex]:not([tabindex='-1'])");
    focusables?.[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && focusables && focusables.length > 1) {
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={closeOnBackdrop ? onClose : undefined} role="presentation">
      <div ref={ref} className={cx(styles.modal, styles[size])} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className={styles.close} type="button" onClick={onClose} aria-label="Close modal">×</button>
        {children}
      </div>
    </div>
  );
}
