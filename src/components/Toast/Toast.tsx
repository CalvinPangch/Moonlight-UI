import React, { createContext, useContext, useMemo, useState } from "react";
import styles from "./Toast.module.css";
import { cx } from "../shared";

type ToastVariant = "info" | "success" | "warning" | "error";
interface ToastItem { id: string; title?: string; message: string; variant: ToastVariant; }
interface ToastContextValue { push: (toast: Omit<ToastItem, "id">, durationMs?: number) => void; }

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const value = useMemo<ToastContextValue>(() => ({
    push: (toast, durationMs = 3200) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { ...toast, id }]);
      window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), durationMs);
    }
  }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={styles.viewport} aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div key={toast.id} className={cx(styles.toast, styles[toast.variant])} role="status">
            {toast.title ? <div className={styles.title}>{toast.title}</div> : null}
            <div>{toast.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
