import React, { useState } from "react";
import styles from "./Tabs.module.css";
import { cx } from "../shared";

export interface TabItem { id: string; label: string; content: React.ReactNode; }

export interface TabsProps {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

export function Tabs({ items, value, defaultValue, onChange }: TabsProps) {
  const [internal, setInternal] = useState(defaultValue ?? items[0]?.id);
  const current = value ?? internal;
  const set = (id: string) => {
    if (value === undefined) setInternal(id);
    onChange?.(id);
  };

  const activeIndex = Math.max(0, items.findIndex((i) => i.id === current));

  return (
    <div className={styles.tabs}>
      <div className={styles.list} role="tablist">
        {items.map((item, index) => (
          <button
            key={item.id}
            role="tab"
            aria-selected={item.id === current}
            className={cx(styles.tab, item.id === current && styles.active)}
            onClick={() => set(item.id)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") set(items[(index + 1) % items.length].id);
              if (e.key === "ArrowLeft") set(items[(index - 1 + items.length) % items.length].id);
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className={styles.panel} role="tabpanel">{items[activeIndex]?.content}</div>
    </div>
  );
}
