import React, { useMemo, useRef, useState } from "react";
import styles from "./Select.module.css";
import { cx } from "../shared";

export interface SelectOption { label: string; value: string; }

export interface SelectProps {
  label?: string;
  options: SelectOption[];
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  placeholder?: string;
  searchable?: boolean;
  multiple?: boolean;
}

export function Select({ label, options, value, onChange, placeholder = "Select...", searchable = false, multiple = false }: SelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase())), [options, query]);
  const values = multiple ? (Array.isArray(value) ? value : []) : [typeof value === "string" ? value : ""];

  const pick = (picked: string) => {
    if (!onChange) return;
    if (multiple) {
      const next = values.includes(picked) ? values.filter((v) => v !== picked) : [...values.filter(Boolean), picked];
      onChange(next);
    } else {
      onChange(picked);
      setOpen(false);
    }
  };

  const selectedLabel = multiple
    ? values.join(", ") || placeholder
    : options.find((o) => o.value === values[0])?.label ?? placeholder;

  return (
    <div className={styles.container} ref={ref}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((x) => !x)}
        onKeyDown={(e) => {
          if (!open && ["ArrowDown", "Enter", " "].includes(e.key)) {
            e.preventDefault();
            setOpen(true);
            return;
          }
          if (!open) return;
          if (e.key === "Escape") setOpen(false);
          if (e.key === "ArrowDown") setActive((a) => Math.min(filtered.length - 1, a + 1));
          if (e.key === "ArrowUp") setActive((a) => Math.max(0, a - 1));
          if (e.key === "Enter" && filtered[active]) pick(filtered[active].value);
        }}
      >
        {selectedLabel}
      </button>
      {open ? (
        <div className={styles.menu} role="listbox">
          {searchable ? <input className={styles.search} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..." /> : null}
          {filtered.map((option, i) => (
            <div
              key={option.value}
              className={cx(styles.option, i === active && styles.active)}
              onClick={() => pick(option.value)}
              role="option"
              aria-selected={values.includes(option.value)}
            >
              {multiple ? (values.includes(option.value) ? "✓ " : "") : ""}
              {option.label}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
