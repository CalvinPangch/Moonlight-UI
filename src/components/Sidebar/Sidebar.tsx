import React, { useMemo, useState } from "react";
import styles from "./Sidebar.module.css";
import { cx } from "../shared";

export interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  children?: SidebarItem[];
}

export interface SidebarProps {
  title?: string;
  items: SidebarItem[];
  value?: string;
  onChange?: (id: string) => void;
  defaultCollapsed?: boolean;
}

export function Sidebar({ title = "Moonlight", items, value, onChange, defaultCollapsed = false }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [internal, setInternal] = useState(items[0]?.id);
  const current = value ?? internal;

  const flatIds = useMemo(() => items.flatMap((x) => [x.id, ...(x.children?.map((c) => c.id) ?? [])]), [items]);

  const pick = (id: string) => {
    if (!flatIds.includes(id)) return;
    if (value === undefined) setInternal(id);
    onChange?.(id);
  };

  return (
    <aside className={cx(styles.sidebar, collapsed && styles.collapsed)}>
      <div className={styles.header}>
        <strong className={cx(styles.brand, collapsed && styles.labelHidden)}>{title}</strong>
        <button className={styles.toggle} type="button" onClick={() => setCollapsed((x) => !x)} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>{collapsed ? '>' : '<'}</button>
      </div>
      <nav className={styles.nav}>
        {items.map((item) => (
          <React.Fragment key={item.id}>
            <button type="button" className={cx(styles.item, current === item.id && styles.active)} onClick={() => pick(item.id)}>
              <span>{item.icon}</span>
              <span className={collapsed ? styles.labelHidden : undefined}>{item.label}</span>
            </button>
            {!collapsed && item.children?.map((child) => (
              <button key={child.id} type="button" className={cx(styles.subItem, current === child.id && styles.active)} onClick={() => pick(child.id)}>
                <span>{child.label}</span>
              </button>
            ))}
          </React.Fragment>
        ))}
      </nav>
    </aside>
  );
}
