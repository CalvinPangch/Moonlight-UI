import type { Meta, StoryObj } from "@storybook/react";
import { ToastProvider, useToast } from "./Toast";

const meta: Meta<typeof ToastProvider> = {
  title: "Core/Toast",
  component: ToastProvider,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

function Demo() {
  const toast = useToast();
  return (
    <div style={{ display: "flex", gap: 10 }}>
      <button type="button" onClick={() => toast.push({ variant: "info", message: "Informational update" })}>Info</button>
      <button type="button" onClick={() => toast.push({ variant: "success", message: "Saved successfully" })}>Success</button>
      <button type="button" onClick={() => toast.push({ variant: "warning", message: "Check your inputs" })}>Warning</button>
      <button type="button" onClick={() => toast.push({ variant: "error", message: "Request failed" })}>Error</button>
    </div>
  );
}

export const Showcase: Story = {
  render: () => (
    <ToastProvider>
      <Demo />
    </ToastProvider>
  ),
};
