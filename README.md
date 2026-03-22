# Moonlight UI

Moonlight UI is a React + TypeScript component framework for dark-first admin dashboards, inspired by Nexus Admin visuals and enterprise grid/chart workflows.

## Install

```bash
npm install moonlight-ui
```

Peer dependencies:

```bash
npm install react react-dom
```

## Quick Start

```tsx
import { ThemeProvider, Button, Card } from 'moonlight-ui'

export function App() {
  return (
    <ThemeProvider>
      <Card header="Moonlight" footer="v0.1.0">
        <Button variant="primary">Launch</Button>
      </Card>
    </ThemeProvider>
  )
}
```

## ThemeProvider

`ThemeProvider` injects the design token CSS variables (colors, spacing, typography, shadows, radius) and wraps your app.

```tsx
import { ThemeProvider } from 'moonlight-ui'

export function Root({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>
}
```

## Component API Summary

| Component | Key Props |
| --- | --- |
| `Button` | `variant`, `size`, `loading`, `leftIcon`, `rightIcon`, `fullWidth` |
| `Card` | `variant`, `header`, `footer` |
| `Modal` | `isOpen`, `onClose`, `size`, `closeOnBackdrop` |
| `Input` | `label`, `error`, `helperText`, `prefix`, `suffix` |
| `Select` | `options`, `value`, `onChange`, `multiple`, `searchable` |
| `DataGrid` | `rowData`, `columnDefs`, `pagination`, `rowSelection`, `groupBy` |
| `Chart` | `type`, `data`, `series`, `xAxis`, `yAxis`, `showLegend`, `showTooltip` |
| `Alert` | `variant`, `title`, `dismissible`, `onClose` |
| `Badge` | `variant`, `dot` |
| `Avatar` | `src`, `alt`, `name`, `size` |
| `Sidebar` | `items`, `collapsed`, `onToggle` |
| `Tabs` | `items`, `value`, `onChange` |
| `Spinner` | `size`, `label` |
| `Tooltip` | `content`, `placement`, `children` |
| `ToastProvider/useToast` | `show`, `duration`, `variant` |

## DataGrid Example

```tsx
import { DataGrid, type ColDef } from 'moonlight-ui'

type User = { id: number; name: string; team: string; score: number }

const columns: ColDef<User>[] = [
  { field: 'name', headerName: 'Name', sortable: true, filterable: true },
  { field: 'team', headerName: 'Team', sortable: true, filterable: true },
  { field: 'score', headerName: 'Score', sortable: true, filterable: true },
]

export function UsersGrid({ rows }: { rows: User[] }) {
  return (
    <DataGrid
      rowData={rows}
      columnDefs={columns}
      pagination
      pageSize={25}
      rowSelection="checkbox"
    />
  )
}
```

## Chart Example

```tsx
import { Chart } from 'moonlight-ui'

const revenue = [
  { month: 'Jan', amount: 120 },
  { month: 'Feb', amount: 160 },
  { month: 'Mar', amount: 140 },
]

export function RevenueChart() {
  return (
    <Chart
      type="line"
      data={revenue}
      series={[{ dataKey: 'amount', name: 'Revenue' }]}
      xAxis={{ dataKey: 'month' }}
      yAxis={{ tickFormat: (value) => `$${value}` }}
      height={320}
      showLegend
      showTooltip
    />
  )
}
```

## Development

```bash
npm run storybook
npm run build
npm run test
npm run test:coverage
```

## Contributing

1. Fork and branch from `main`.
2. Add/update component stories in `src/components/**`.
3. Add tests for behavior and a11y-sensitive paths.
4. Run `npm run type-check`, `npm run test:coverage`, and `npm run build`.
5. Submit a PR with screenshots for visual changes.
