import type { Meta, StoryObj } from "@storybook/react";
import { Tooltip } from "./Tooltip";

const meta: Meta<typeof Tooltip> = {
  title: "Core/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Placements: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 20, padding: 40 }}>
      <Tooltip content="Top tooltip" placement="top"><button type="button">Top</button></Tooltip>
      <Tooltip content="Bottom tooltip" placement="bottom"><button type="button">Bottom</button></Tooltip>
      <Tooltip content="Left tooltip" placement="left"><button type="button">Left</button></Tooltip>
      <Tooltip content="Right tooltip" placement="right"><button type="button">Right</button></Tooltip>
    </div>
  ),
};
