import type { Meta, StoryObj } from "@storybook/react";
import { Alert } from "./Alert";

const meta: Meta<typeof Alert> = {
  title: "Core/Alert",
  component: Alert,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Variants: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 10 }}>
      <Alert variant="info">Informational message</Alert>
      <Alert variant="success">Success message</Alert>
      <Alert variant="warning" dismissible>Warning, dismissible</Alert>
      <Alert variant="error">Error message</Alert>
    </div>
  ),
};
