import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "./Card";

const meta: Meta<typeof Card> = {
  title: "Core/Card",
  component: Card,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
      <Card header="Default" footer="Footer">Body content</Card>
      <Card variant="elevated" header="Elevated">Body content</Card>
      <Card variant="bordered" header="Bordered">Body content</Card>
    </div>
  ),
};
