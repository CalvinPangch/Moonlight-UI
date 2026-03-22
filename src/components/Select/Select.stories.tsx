import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Select } from "./Select";

const meta: Meta<typeof Select> = {
  title: "Core/Select",
  component: Select,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const options = [
  { label: "Platform", value: "platform" },
  { label: "Growth", value: "growth" },
  { label: "Design", value: "design" },
  { label: "QA", value: "qa" },
];

export const SingleAndMulti: Story = {
  render: () => {
    const [single, setSingle] = useState<string | string[]>("platform");
    const [multi, setMulti] = useState<string | string[]>(["design"]);

    return (
      <div style={{ display: "grid", gap: 14, maxWidth: 360 }}>
        <Select label="Single" options={options} value={single} onChange={setSingle} searchable />
        <Select label="Multiple" options={options} value={multi} onChange={setMulti} searchable multiple />
      </div>
    );
  },
};
