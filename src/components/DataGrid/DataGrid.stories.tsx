import { useMemo, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DataGrid } from "./DataGrid";
import type { ColDef, DataGridRef } from "./DataGrid";

type DemoRow = {
  id: string;
  region: string;
  team: string;
  owner: string;
  status: "Backlog" | "In Progress" | "Review" | "Done";
  tickets: number;
  velocity: number;
  spend: number;
  updatedAt: string;
};

const statuses: DemoRow["status"][] = ["Backlog", "In Progress", "Review", "Done"];
const regions = ["APAC", "EMEA", "AMER"];
const teams = ["Platform", "Growth", "Payments", "Design", "QA", "Core"];
const owners = ["Avery", "Kai", "Noah", "Luna", "Maya", "Iris", "Jules", "Theo"];

function seededValue(seed: number, mod: number): number {
  let x = Math.sin(seed * 9187.133 + 13.73) * 10000;
  x -= Math.floor(x);
  return Math.floor(x * mod);
}

function makeRows(count: number, seedOffset = 0): DemoRow[] {
  return Array.from({ length: count }).map((_, idx) => {
    const seed = idx + seedOffset;
    const status = statuses[seededValue(seed, statuses.length)];
    const team = teams[seededValue(seed * 2, teams.length)];
    const region = regions[seededValue(seed * 3, regions.length)];
    const owner = owners[seededValue(seed * 5, owners.length)];
    const tickets = 5 + seededValue(seed * 7, 140);
    const velocity = 10 + seededValue(seed * 11, 90);
    const spend = 1000 + seededValue(seed * 17, 40000);

    return {
      id: `ROW-${seed + 1}`,
      region,
      team,
      owner,
      status,
      tickets,
      velocity,
      spend,
      updatedAt: new Date(2026, seededValue(seed * 13, 12), 1 + seededValue(seed * 19, 28))
        .toISOString()
        .slice(0, 10),
    };
  });
}

const columns: ColDef<DemoRow>[] = [
  {
    headerName: "Identity",
    field: "id",
    children: [
      { field: "id", headerName: "ID", width: 120, pinned: "left", sortable: true, filterable: true },
      { field: "region", headerName: "Region", width: 120, sortable: true, filterable: true, resizable: true },
      { field: "team", headerName: "Team", width: 140, sortable: true, filterable: true, resizable: true },
      { field: "owner", headerName: "Owner", width: 140, sortable: true, filterable: true, resizable: true },
    ],
  },
  {
    headerName: "Execution",
    field: "status",
    children: [
      {
        field: "status",
        headerName: "Status",
        width: 140,
        sortable: true,
        filterable: true,
        resizable: true,
        cellRenderer: ({ value }) => (
          <span
            style={{
              padding: "2px 10px",
              borderRadius: 999,
              fontSize: "var(--font-size-xs)",
              background:
                value === "Done"
                  ? "color-mix(in srgb, var(--color-success) 25%, transparent)"
                  : value === "Review"
                    ? "color-mix(in srgb, var(--color-warning) 20%, transparent)"
                    : value === "In Progress"
                      ? "color-mix(in srgb, var(--color-accent) 20%, transparent)"
                      : "color-mix(in srgb, var(--color-text-muted) 18%, transparent)",
            }}
          >
            {String(value)}
          </span>
        ),
      },
      {
        field: "tickets",
        headerName: "Tickets",
        width: 120,
        sortable: true,
        filterable: true,
        resizable: true,
      },
      {
        field: "velocity",
        headerName: "Velocity",
        width: 120,
        sortable: true,
        filterable: true,
        resizable: true,
        cellEditor: ({ value, onChange }) => (
          <input
            value={String(value ?? "")}
            type="number"
            onChange={(event) => onChange(Number(event.target.value))}
            style={{ width: "100%", padding: 6 }}
          />
        ),
      },
      {
        field: "spend",
        headerName: "Spend",
        width: 140,
        sortable: true,
        filterable: true,
        resizable: true,
        valueFormatter: ({ value }) => `$${Number(value).toLocaleString()}`,
      },
      {
        field: "updatedAt",
        headerName: "Updated",
        width: 140,
        sortable: true,
        filterable: true,
        resizable: true,
        pinned: "right",
      },
    ],
  },
];

const meta: Meta<typeof DataGrid<DemoRow>> = {
  title: "Data Display/DataGrid",
  component: DataGrid,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

function DemoGrid({ infinite = false }: { infinite?: boolean }) {
  const gridRef = useRef<DataGridRef>(null);
  const [rows, setRows] = useState<DemoRow[]>(() => makeRows(infinite ? 300 : 10000));
  const [hasMoreRows, setHasMoreRows] = useState(true);

  const data = useMemo(() => rows, [rows]);

  return (
    <div style={{ display: "grid", gap: "var(--spacing-3)", padding: "var(--spacing-2)" }}>
      <div style={{ display: "flex", gap: "var(--spacing-2)" }}>
        <button type="button" onClick={() => gridRef.current?.exportToCsv("moonlight-grid.csv")}>Export CSV</button>
        <button type="button" onClick={() => setRows(makeRows(infinite ? 300 : 10000, 777))}>Reload Data</button>
      </div>

      <DataGrid
        ref={gridRef}
        rowData={data}
        columnDefs={columns}
        height={520}
        rowHeight={40}
        headerHeight={48}
        pagination={!infinite}
        pageSize={25}
        rowSelection="checkbox"
        groupBy="region"
        infiniteScroll={infinite}
        hasMoreRows={hasMoreRows}
        onLoadMore={
          infinite
            ? () => {
                if (!hasMoreRows) {
                  return;
                }
                setTimeout(() => {
                  setRows((prev) => {
                    const next = [...prev, ...makeRows(200, prev.length + 2000)];
                    if (next.length >= 1000) {
                      setHasMoreRows(false);
                    }
                    return next;
                  });
                }, 500);
              }
            : undefined
        }
        onCellValueChanged={({ row, column, newValue }) => {
          setRows((prev) =>
            prev.map((candidate) =>
              candidate.id === row.id
                ? ({ ...candidate, [column.field]: newValue } as DemoRow)
                : candidate,
            ),
          );
        }}
      />
    </div>
  );
}

export const TenThousandRows: Story = {
  render: () => <DemoGrid />,
};

export const InfiniteScrollMode: Story = {
  render: () => <DemoGrid infinite />,
};
