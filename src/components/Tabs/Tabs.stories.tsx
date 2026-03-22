import type { Meta, StoryObj } from "@storybook/react";
import { Tabs } from "./Tabs";

const meta: Meta<typeof Tabs> = {
  title: "Core/Tabs",
  component: Tabs,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <Tabs
      items={[
        { id: "overview", label: "Overview", content: <p>Overview content</p> },
        { id: "activity", label: "Activity", content: <p>Activity content</p> },
        { id: "settings", label: "Settings", content: <p>Settings content</p> },
      ]}
      defaultValue="overview"
    />
  ),
};
