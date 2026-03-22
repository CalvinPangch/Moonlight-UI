import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Sidebar } from "./Sidebar";

const meta: Meta<typeof Sidebar> = {
  title: "Core/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const nav = [
  { id: "dashboard", label: "Dashboard", icon: "DB" },
  {
    id: "projects",
    label: "Projects",
    icon: "PR",
    children: [
      { id: "active", label: "Active" },
      { id: "archived", label: "Archived" },
    ],
  },
  { id: "settings", label: "Settings", icon: "ST" },
];

export const Collapsible: Story = {
  render: () => {
    const [value, setValue] = useState("dashboard");
    return (
      <div style={{ display: "flex", minHeight: 300 }}>
        <Sidebar items={nav} value={value} onChange={setValue} />
        <main style={{ padding: 16 }}>Active item: {value}</main>
      </div>
    );
  },
};
