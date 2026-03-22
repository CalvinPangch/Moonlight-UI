import type { Meta, StoryObj } from "@storybook/react";
import { Chart } from "./Chart";

type RevenueRow = {
  month: string;
  revenue: number;
  target: number;
  expenses: number;
  users: number;
};

type SegmentRow = {
  segment: string;
  value: number;
};

type ScatterRow = {
  cohort: string;
  acquisitionCost: number;
  conversionRate: number;
  users: number;
  color: string;
};

const revenueData: RevenueRow[] = [
  { month: "Jan", revenue: 120, target: 100, expenses: 84, users: 820 },
  { month: "Feb", revenue: 98, target: 105, expenses: 81, users: 860 },
  { month: "Mar", revenue: 132, target: 115, expenses: 93, users: 905 },
  { month: "Apr", revenue: 165, target: 132, expenses: 112, users: 980 },
  { month: "May", revenue: 151, target: 140, expenses: 106, users: 1022 },
  { month: "Jun", revenue: 184, target: 150, expenses: 118, users: 1108 },
  { month: "Jul", revenue: 205, target: 172, expenses: 130, users: 1189 },
  { month: "Aug", revenue: 198, target: 180, expenses: 134, users: 1241 },
];

const pieData: SegmentRow[] = [
  { segment: "Direct", value: 42 },
  { segment: "Search", value: 27 },
  { segment: "Partner", value: 18 },
  { segment: "Social", value: 13 },
];

const scatterData: ScatterRow[] = [
  { cohort: "A", acquisitionCost: 22, conversionRate: 4.1, users: 180, color: "#58a6ff" },
  { cohort: "B", acquisitionCost: 35, conversionRate: 6.3, users: 420, color: "#3fb950" },
  { cohort: "C", acquisitionCost: 28, conversionRate: 5.4, users: 265, color: "#d29922" },
  { cohort: "D", acquisitionCost: 48, conversionRate: 7.1, users: 520, color: "#f85149" },
  { cohort: "E", acquisitionCost: 30, conversionRate: 5.9, users: 332, color: "#8b5cf6" },
  { cohort: "F", acquisitionCost: 18, conversionRate: 3.7, users: 150, color: "#06b6d4" },
];

const meta: Meta<typeof Chart<RevenueRow>> = {
  title: "Data Display/Chart",
  component: Chart,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Line: Story = {
  render: () => (
    <Chart
      type="line"
      data={revenueData}
      series={[
        { dataKey: "revenue", name: "Revenue" },
        { dataKey: "target", name: "Target" },
      ]}
      xAxis={{ dataKey: "month", label: "Month" }}
      yAxis={{ label: "USD (k)", tickFormat: (value) => `$${value}` }}
      height={360}
      showLegend
      showTooltip
      smooth
    />
  ),
};

export const BarGrouped: Story = {
  render: () => (
    <Chart
      type="bar"
      data={revenueData}
      series={[
        { dataKey: "revenue", name: "Revenue" },
        { dataKey: "expenses", name: "Expenses" },
      ]}
      xAxis={{ dataKey: "month", label: "Month" }}
      yAxis={{ label: "USD (k)", tickFormat: (value) => `$${value}` }}
      height={360}
      barMode="grouped"
      barGap={12}
      showLegend
      showTooltip
    />
  ),
};

export const PieDonut: Story = {
  render: () => (
    <Chart
      type="pie"
      data={pieData}
      series={[{ dataKey: "value", name: "Traffic" }]}
      xAxis={{ dataKey: "segment" }}
      donutCutout={0.58}
      legendLayout="vertical"
      height={360}
      showLegend
      showTooltip
    />
  ),
};

export const AreaStacked: Story = {
  render: () => (
    <Chart
      type="area"
      data={revenueData}
      series={[
        { dataKey: "revenue", name: "Revenue" },
        { dataKey: "expenses", name: "Expenses" },
      ]}
      xAxis={{ dataKey: "month", label: "Month" }}
      yAxis={{ label: "USD (k)", tickFormat: (value) => `$${value}` }}
      height={360}
      showLegend
      showTooltip
      smooth
    />
  ),
};

export const Scatter: Story = {
  render: () => (
    <Chart
      type="scatter"
      data={scatterData}
      series={[
        {
          dataKey: "conversionRate",
          name: "Cohorts",
          xKey: "acquisitionCost",
          yKey: "conversionRate",
          sizeKey: "users",
          colorKey: "color",
        },
      ]}
      xAxis={{ dataKey: "acquisitionCost", label: "Acquisition Cost" }}
      yAxis={{ label: "Conversion %", tickFormat: (value) => `${value}%` }}
      height={360}
      showLegend
      showTooltip
      showPoints
      grid={{ horizontal: true, vertical: true }}
    />
  ),
};

export const BarHorizontalStacked: Story = {
  render: () => (
    <Chart
      type="bar"
      data={revenueData}
      series={[
        { dataKey: "revenue", name: "Revenue" },
        { dataKey: "expenses", name: "Expenses" },
      ]}
      xAxis={{ dataKey: "month", label: "Category" }}
      yAxis={{ label: "USD (k)", tickFormat: (value) => `$${value}` }}
      height={380}
      orientation="horizontal"
      barMode="stacked"
      showLegend
      showTooltip
    />
  ),
};
