import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Input, Textarea } from "./Input";

const meta: Meta<typeof Input> = {
  title: "Core/Input",
  component: Input,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const FormControls: Story = {
  render: () => {
    const [value, setValue] = useState("Moonlight");
    return (
      <div style={{ display: "grid", gap: 12, maxWidth: 420 }}>
        <Input label="Name" value={value} onChange={(e) => setValue(e.target.value)} helperText="Used for your display profile" />
        <Input label="Budget" prefix="$" suffix="USD" placeholder="1000" />
        <Input label="With error" error="This field is required" />
        <Textarea label="Notes" rows={4} placeholder="Write details..." helperText="Multiline text" />
      </div>
    );
  },
};
