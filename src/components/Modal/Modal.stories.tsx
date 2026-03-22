import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Modal } from "./Modal";

const meta: Meta<typeof Modal> = {
  title: "Core/Modal",
  component: Modal,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div>
        <button type="button" onClick={() => setOpen(true)}>Open Modal</button>
        <Modal isOpen={open} onClose={() => setOpen(false)} size="md">
          <h3>Modal Title</h3>
          <p>Keyboard trap and Escape close are enabled.</p>
          <button type="button" onClick={() => setOpen(false)}>Close</button>
        </Modal>
      </div>
    );
  },
};
