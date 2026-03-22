import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from "./Avatar";

const meta: Meta<typeof Avatar> = {
  title: "Core/Avatar",
  component: Avatar,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      <Avatar size="xs" name="Ada Lovelace" />
      <Avatar size="sm" name="Grace Hopper" />
      <Avatar size="md" name="Margaret Hamilton" />
      <Avatar size="lg" name="Linus Torvalds" />
    </div>
  ),
};
