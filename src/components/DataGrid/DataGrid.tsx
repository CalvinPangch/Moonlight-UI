import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "./DataGrid.module.css";
import { clamp, cx } from "../shared";

type SortDirection = "asc" | "desc";

export interface CellRendererParams<T> {
  row: T;
  value: unknown;
  rowIndex: number;
  column: ColDef<T>;
}

export interface CellEditorParams<T> {
  row: T;
  value: unknown;
  rowIndex: number;
  column: ColDef<T>;
  onChange: (nextValue: unknown) => void;
}

export interface ValueGetterParams<T> {
  row: T;
  rowIndex: number;
  column: ColDef<T>;
}

export interface ValueFormatterParams<T> {
  value: unknown;
  row: T;
  rowIndex: number;
  column: ColDef<T>;
}

export interface ColDef<T> {
  field: keyof T;
  headerName: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  sortable?: boolean;
  filterable?: boolean;
  resizable?: boolean;
  pinned?: "left" | "right";
  cellRenderer?: (params: CellRendererParams<T>) => React.ReactNode;
  cellEditor?: (params: CellEditorParams<T>) => React.ReactNode;
  valueGetter?: (params: ValueGetterParams<T>) => unknown;
  valueFormatter?: (params: ValueFormatterParams<T>) => string;
  children?: ColDef<T>[];
}

export interface DataGridRef {
  exportToCsv: (fileName?: string) => void;
}

interface SortEntry<T> {
  field: keyof T;
  direction: SortDirection;
}

type FilterType = "text" | "number";

interface FilterValue {
  type: FilterType;
  text?: string;
  exact?: number;
  min?: number;
  max?: number;
}

interface GroupRow<T> {
  __group: true;
  key: string;
  label: string;
  level: number;
  count: number;
  rows: T[];
}

type GridRow<T> = T | GroupRow<T>;

type InternalCol<T> = ColDef<T> & {
  id: string;
  parentId?: string;
  groupDepth: number;
};

export interface CellValueChangedParams<T> {
  row: T;
  rowIndex: number;
  column: ColDef<T>;
  oldValue: unknown;
  newValue: unknown;
}

export interface DataGridProps<T extends Record<string, unknown>> {
  rowData: T[];
  columnDefs: ColDef<T>[];
  rowHeight?: number;
  headerHeight?: number;
  height?: number;
  pagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  rowSelection?: "single" | "multiple" | "checkbox";
  onSelectionChanged?: (rows: T[]) => void;
  onRowClicked?: (row: T) => void;
  onCellValueChanged?: (params: CellValueChangedParams<T>) => void;
  groupBy?: keyof T;
  infiniteScroll?: boolean;
  onLoadMore?: () => void;
  hasMoreRows?: boolean;
  isLoadingMore?: boolean;
  className?: string;
}

function isGroupRow<T>(row: GridRow<T>): row is GroupRow<T> {
  return typeof row === "object" && row !== null && "__group" in row;
}

function parseFilterValue(raw: string, sample: unknown): FilterValue {
  if (typeof sample === "number") {
    const trimmed = raw.trim();
    const rangeMatch = trimmed.match(/^(-?\d+(?:\.\d+)?)\s*-\s*(-?\d+(?:\.\d+)?)$/);
    if (rangeMatch) {
      const min = Number(rangeMatch[1]);
      const max = Number(rangeMatch[2]);
      return { type: "number", min: Math.min(min, max), max: Math.max(min, max) };
    }

    if (trimmed.length > 0 && !Number.isNaN(Number(trimmed))) {
      return { type: "number", exact: Number(trimmed) };
    }

    return { type: "number" };
  }

  return { type: "text", text: raw.toLowerCase().trim() };
}

function defaultFormat(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value);
}

function flattenColumns<T>(columns: ColDef<T>[], depth = 0, parentId?: string): InternalCol<T>[] {
  return columns.flatMap((column, index) => {
    const id = parentId ? `${parentId}.${index}` : `${index}`;
    if (column.children && column.children.length > 0) {
      return flattenColumns(column.children, depth + 1, id);
    }

    return [
      {
        ...column,
        id,
        parentId,
        groupDepth: depth,
      },
    ];
  });
}

function getHeaderDepth<T>(columns: ColDef<T>[], depth = 1): number {
  return columns.reduce((maxDepth, column) => {
    if (!column.children || column.children.length === 0) {
      return Math.max(maxDepth, depth);
    }
    return Math.max(maxDepth, getHeaderDepth(column.children, depth + 1));
  }, depth);
}

function buildCsv<T extends Record<string, unknown>>(
  rows: T[],
  columns: InternalCol<T>[],
  getValue: (row: T, column: InternalCol<T>, rowIndex: number) => unknown,
): string {
  const escapeCsv = (value: string): string => {
    if (value.includes(",") || value.includes("\n") || value.includes("\"")) {
      return `"${value.replace(/\"/g, '""')}"`;
    }
    return value;
  };

  const headers = columns.map((col) => escapeCsv(col.headerName)).join(",");
  const body = rows
    .map((row, rowIndex) =>
      columns
        .map((col) => escapeCsv(defaultFormat(getValue(row, col, rowIndex))))
        .join(","),
    )
    .join("\n");

  return `${headers}\n${body}`;
}

function DataGridInner<T extends Record<string, unknown>>(
  {
    rowData,
    columnDefs,
    rowHeight = 40,
    headerHeight = 48,
    height = 480,
    pagination = false,
    pageSize = 25,
    pageSizeOptions = [10, 25, 50, 100],
    rowSelection = "multiple",
    onSelectionChanged,
    onRowClicked,
    onCellValueChanged,
    groupBy,
    infiniteScroll = false,
    onLoadMore,
    hasMoreRows = true,
    isLoadingMore = false,
    className,
  }: DataGridProps<T>,
  ref: React.ForwardedRef<DataGridRef>,
) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const flattenedColumns = useMemo(() => flattenColumns(columnDefs), [columnDefs]);
  const headerDepth = useMemo(() => getHeaderDepth(columnDefs), [columnDefs]);

  const initialWidths = useMemo(() => {
    const widths: Record<string, number> = {};
    for (const col of flattenedColumns) {
      widths[col.id] = col.width ?? 180;
    }
    return widths;
  }, [flattenedColumns]);

  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(initialWidths);
  const [sortModel, setSortModel] = useState<Array<SortEntry<T>>>([]);
  const [filterInputs, setFilterInputs] = useState<Record<string, string>>({});
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);
  const [scrollTop, setScrollTop] = useState(0);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<{ rowKey: string; colId: string } | null>(null);
  const [editDraftValue, setEditDraftValue] = useState<unknown>("");

  useEffect(() => {
    setColumnWidths(initialWidths);
  }, [initialWidths]);

  useEffect(() => {
    setCurrentPage(1);
  }, [rowData, sortModel, filterInputs, currentPageSize]);

  const getRowKey = useCallback((row: T, index: number) => {
    const candidate = (row as { id?: unknown }).id;
    if (typeof candidate === "string" || typeof candidate === "number") {
      return String(candidate);
    }
    return `row-${index}`;
  }, []);

  const getCellValue = useCallback(
    (row: T, col: InternalCol<T>, rowIndex: number) => {
      if (col.valueGetter) {
        return col.valueGetter({ row, rowIndex, column: col });
      }
      return row[col.field];
    },
    [],
  );

  const filteredRows = useMemo(() => {
    return rowData.filter((row, rowIndex) => {
      for (const col of flattenedColumns) {
        if (!col.filterable) {
          continue;
        }

        const raw = filterInputs[col.id];
        if (!raw || raw.trim() === "") {
          continue;
        }

        const value = getCellValue(row, col, rowIndex);
        const parsed = parseFilterValue(raw, value);

        if (parsed.type === "text") {
          const formatted = defaultFormat(value).toLowerCase();
          if (!formatted.includes(parsed.text ?? "")) {
            return false;
          }
          continue;
        }

        if (typeof value !== "number") {
          return false;
        }

        if (typeof parsed.exact === "number" && value !== parsed.exact) {
          return false;
        }

        if (typeof parsed.min === "number" && value < parsed.min) {
          return false;
        }

        if (typeof parsed.max === "number" && value > parsed.max) {
          return false;
        }
      }

      return true;
    });
  }, [filterInputs, flattenedColumns, getCellValue, rowData]);

  const sortedRows = useMemo(() => {
    if (sortModel.length === 0) {
      return filteredRows;
    }

    const sortable = [...filteredRows];
    sortable.sort((a, b) => {
      for (const sort of sortModel) {
        const col = flattenedColumns.find((c) => c.field === sort.field);
        if (!col) {
          continue;
        }

        const aValue = getCellValue(a, col, rowData.indexOf(a));
        const bValue = getCellValue(b, col, rowData.indexOf(b));

        if (aValue === bValue) {
          continue;
        }

        const directionFactor = sort.direction === "asc" ? 1 : -1;

        if (aValue === null || aValue === undefined) {
          return 1 * directionFactor;
        }
        if (bValue === null || bValue === undefined) {
          return -1 * directionFactor;
        }

        if (typeof aValue === "number" && typeof bValue === "number") {
          return (aValue - bValue) * directionFactor;
        }

        return String(aValue).localeCompare(String(bValue)) * directionFactor;
      }

      return 0;
    });

    return sortable;
  }, [filteredRows, flattenedColumns, getCellValue, rowData, sortModel]);

  const rowsWithGrouping = useMemo<Array<GridRow<T>>>(() => {
    if (!groupBy) {
      return sortedRows;
    }

    const groups = new Map<string, T[]>();
    for (const row of sortedRows) {
      const key = defaultFormat(row[groupBy]);
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)?.push(row);
    }

    const grouped: Array<GridRow<T>> = [];
    for (const [key, rows] of groups) {
      grouped.push({
        __group: true,
        key,
        label: key === "" ? "(Empty)" : key,
        level: 0,
        count: rows.length,
        rows,
      });

      if (!collapsedGroups.has(key)) {
        grouped.push(...rows);
      }
    }

    return grouped;
  }, [collapsedGroups, groupBy, sortedRows]);

  const pagedRows = useMemo(() => {
    if (!pagination || infiniteScroll) {
      return rowsWithGrouping;
    }

    const start = (currentPage - 1) * currentPageSize;
    const end = start + currentPageSize;
    return rowsWithGrouping.slice(start, end);
  }, [currentPage, currentPageSize, infiniteScroll, pagination, rowsWithGrouping]);

  const pageCount = useMemo(() => {
    if (!pagination || infiniteScroll) {
      return 1;
    }
    return Math.max(1, Math.ceil(rowsWithGrouping.length / currentPageSize));
  }, [currentPageSize, infiniteScroll, pagination, rowsWithGrouping.length]);

  const totalContentHeight = pagedRows.length * rowHeight;
  const overscan = 8;
  const viewportHeight = Math.max(height - headerHeight * (1 + (flattenedColumns.some((c) => c.filterable) ? 1 : 0)), rowHeight * 4);
  const startIndex = clamp(Math.floor(scrollTop / rowHeight) - overscan, 0, Math.max(0, pagedRows.length - 1));
  const endIndex = clamp(
    Math.ceil((scrollTop + viewportHeight) / rowHeight) + overscan,
    0,
    Math.max(0, pagedRows.length),
  );
  const visibleRows = pagedRows.slice(startIndex, endIndex);

  const getSortForField = useCallback(
    (field: keyof T) => sortModel.find((sort) => sort.field === field),
    [sortModel],
  );

  const handleSortClick = useCallback(
    (field: keyof T, shiftKey: boolean) => {
      setSortModel((prev) => {
        const existing = prev.find((entry) => entry.field === field);

        const nextDirection: SortDirection | null =
          existing?.direction === "asc" ? "desc" : existing?.direction === "desc" ? null : "asc";

        if (!shiftKey) {
          if (!nextDirection) {
            return [];
          }
          return [{ field, direction: nextDirection }];
        }

        const withoutField = prev.filter((entry) => entry.field !== field);
        if (!nextDirection) {
          return withoutField;
        }

        return [...withoutField, { field, direction: nextDirection }];
      });
    },
    [],
  );

  const pinnedLeftOffsets = useMemo(() => {
    let offset = rowSelection === "checkbox" ? 48 : 0;
    const map: Record<string, number> = {};
    for (const col of flattenedColumns) {
      if (col.pinned === "left") {
        map[col.id] = offset;
        offset += columnWidths[col.id] ?? 180;
      }
    }
    return map;
  }, [columnWidths, flattenedColumns, rowSelection]);

  const pinnedRightOffsets = useMemo(() => {
    let offset = 0;
    const rightCols = flattenedColumns.filter((col) => col.pinned === "right").reverse();
    const map: Record<string, number> = {};
    for (const col of rightCols) {
      map[col.id] = offset;
      offset += columnWidths[col.id] ?? 180;
    }
    return map;
  }, [columnWidths, flattenedColumns]);

  const selectedRows = useMemo(() => {
    return rowData.filter((row, rowIndex) => selectedKeys.has(getRowKey(row, rowIndex)));
  }, [getRowKey, rowData, selectedKeys]);

  useEffect(() => {
    onSelectionChanged?.(selectedRows);
  }, [onSelectionChanged, selectedRows]);

  const toggleRowSelected = useCallback(
    (row: T, rowIndex: number) => {
      const rowKey = getRowKey(row, rowIndex);
      setSelectedKeys((prev) => {
        if (rowSelection === "single") {
          return prev.has(rowKey) ? new Set<string>() : new Set([rowKey]);
        }

        const next = new Set(prev);
        if (next.has(rowKey)) {
          next.delete(rowKey);
        } else {
          next.add(rowKey);
        }
        return next;
      });
    },
    [getRowKey, rowSelection],
  );

  const allSelectableRows = useMemo(
    () => pagedRows.filter((row): row is T => !isGroupRow(row)),
    [pagedRows],
  );

  const allSelected = useMemo(() => {
    if (allSelectableRows.length === 0) {
      return false;
    }

    return allSelectableRows.every((row, index) => selectedKeys.has(getRowKey(row, index)));
  }, [allSelectableRows, getRowKey, selectedKeys]);

  const toggleAll = useCallback(() => {
    setSelectedKeys((prev) => {
      if (allSelected) {
        return new Set();
      }

      const next = new Set(prev);
      allSelectableRows.forEach((row, index) => {
        next.add(getRowKey(row, index));
      });
      return next;
    });
  }, [allSelectableRows, allSelected, getRowKey]);

  const handleResizeStart = useCallback(
    (event: React.MouseEvent, col: InternalCol<T>) => {
      event.preventDefault();
      event.stopPropagation();

      const startX = event.clientX;
      const startWidth = columnWidths[col.id] ?? 180;
      const minWidth = col.minWidth ?? 80;
      const maxWidth = col.maxWidth ?? 720;

      const onMouseMove = (moveEvent: MouseEvent) => {
        const delta = moveEvent.clientX - startX;
        const nextWidth = clamp(startWidth + delta, minWidth, maxWidth);
        setColumnWidths((prev) => ({ ...prev, [col.id]: nextWidth }));
      };

      const onMouseUp = () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [columnWidths],
  );

  const commitEdit = useCallback(
    (row: T, rowIndex: number, col: InternalCol<T>) => {
      const oldValue = getCellValue(row, col, rowIndex);
      const newValue = editDraftValue;
      setEditingCell(null);

      if (oldValue === newValue) {
        return;
      }

      onCellValueChanged?.({
        row,
        rowIndex,
        column: col,
        oldValue,
        newValue,
      });
    },
    [editDraftValue, getCellValue, onCellValueChanged],
  );

  const triggerLoadMore = useCallback(() => {
    if (!infiniteScroll || !onLoadMore || !hasMoreRows || isLoadingMore) {
      return;
    }

    onLoadMore();
  }, [hasMoreRows, infiniteScroll, isLoadingMore, onLoadMore]);

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const target = event.currentTarget;
      setScrollTop(target.scrollTop);

      if (
        infiniteScroll &&
        target.scrollTop + target.clientHeight >= target.scrollHeight - rowHeight * 2
      ) {
        triggerLoadMore();
      }
    },
    [infiniteScroll, rowHeight, triggerLoadMore],
  );

  useImperativeHandle(
    ref,
    () => ({
      exportToCsv: (fileName = "datagrid-export.csv") => {
        const csv = buildCsv(sortedRows, flattenedColumns, (row, col, rowIndex) =>
          getCellValue(row, col, rowIndex),
        );

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      },
    }),
    [flattenedColumns, getCellValue, sortedRows],
  );

  const hasFilterRow = flattenedColumns.some((col) => col.filterable);

  const renderHeaderCells = (columns: ColDef<T>[], level: number, parentId = ""): React.ReactNode => {
    return columns.map((col, index) => {
      const id = parentId ? `${parentId}.${index}` : `${index}`;
      const leafColumns = flattenColumns([col], level, parentId);
      const isGroup = Boolean(col.children && col.children.length > 0);

      if (isGroup) {
        return (
          <div
            key={`group-${id}`}
            className={cx(styles.headerCell, styles.groupHeaderCell)}
            style={{
              width: leafColumns.reduce((acc, leaf) => acc + (columnWidths[leaf.id] ?? 180), 0),
              minWidth: leafColumns.reduce((acc, leaf) => acc + (columnWidths[leaf.id] ?? 180), 0),
              height: headerHeight,
            }}
          >
            <span>{col.headerName}</span>
          </div>
        );
      }

      const internal = flattenedColumns.find((leaf) => leaf.id === id);
      if (!internal) {
        return null;
      }

      const sort = getSortForField(internal.field);
      const width = columnWidths[internal.id] ?? 180;
      const isFilterActive = Boolean(filterInputs[internal.id]?.trim());
      const pinnedClass =
        internal.pinned === "left"
          ? styles.pinnedLeft
          : internal.pinned === "right"
            ? styles.pinnedRight
            : undefined;
      const pinnedStyle =
        internal.pinned === "left"
          ? { left: pinnedLeftOffsets[internal.id] }
          : internal.pinned === "right"
            ? { right: pinnedRightOffsets[internal.id] }
            : undefined;

      return (
        <div
          key={`leaf-${id}`}
          className={cx(styles.headerCell, sort && styles.sorted, isFilterActive && styles.filtered, pinnedClass)}
          style={{ width, minWidth: width, height: headerHeight, ...pinnedStyle }}
          onClick={(event) => internal.sortable && handleSortClick(internal.field, event.shiftKey)}
          role={internal.sortable ? "button" : undefined}
          tabIndex={internal.sortable ? 0 : -1}
          onKeyDown={(event) => {
            if (!internal.sortable) {
              return;
            }
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleSortClick(internal.field, event.shiftKey);
            }
          }}
        >
          <span className={styles.headerLabel}>{internal.headerName}</span>
          <span className={styles.headerMeta}>
            {sort?.direction === "asc" ? "↑" : sort?.direction === "desc" ? "↓" : ""}
          </span>
          {internal.resizable && (
            <span
              className={styles.resizeHandle}
              onMouseDown={(event) => handleResizeStart(event, internal)}
              role="separator"
              aria-orientation="vertical"
            />
          )}
        </div>
      );
    });
  };

  return (
    <div className={cx(styles.wrapper, className)}>
      <div className={styles.toolbar}>
        <div className={styles.rowCount}>Rows: {rowsWithGrouping.length}</div>
        {pagination && !infiniteScroll && (
          <label className={styles.pageSizeLabel}>
            Page size
            <select
              className={styles.pageSizeSelect}
              value={currentPageSize}
              onChange={(event) => {
                setCurrentPageSize(Number(event.target.value));
                setCurrentPage(1);
              }}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className={styles.gridFrame}>
        <div className={styles.header}>
          {rowSelection === "checkbox" && (
            <div className={cx(styles.headerCell, styles.selectionHeader)} style={{ width: 48, minWidth: 48 }}>
              <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all rows" />
            </div>
          )}
          <div className={styles.headerRows}>
            {Array.from({ length: headerDepth }).map((_, level) => (
              <div key={`header-level-${level}`} className={styles.headerRow}>
                {renderHeaderCells(columnDefs, level)}
              </div>
            ))}
            {hasFilterRow && (
              <div className={styles.filterRow}>
                {flattenedColumns.map((col) => {
                  const width = columnWidths[col.id] ?? 180;
                  const pinnedClass =
                    col.pinned === "left"
                      ? styles.pinnedLeft
                      : col.pinned === "right"
                        ? styles.pinnedRight
                        : undefined;
                  const pinnedStyle =
                    col.pinned === "left"
                      ? { left: pinnedLeftOffsets[col.id] }
                      : col.pinned === "right"
                        ? { right: pinnedRightOffsets[col.id] }
                        : undefined;

                  return (
                    <div
                      key={`filter-${col.id}`}
                      className={cx(styles.filterCell, pinnedClass)}
                      style={{ width, minWidth: width, ...pinnedStyle }}
                    >
                      {col.filterable ? (
                        <input
                          className={styles.filterInput}
                          value={filterInputs[col.id] ?? ""}
                          onChange={(event) =>
                            setFilterInputs((prev) => ({
                              ...prev,
                              [col.id]: event.target.value,
                            }))
                          }
                          placeholder={typeof rowData[0]?.[col.field] === "number" ? "e.g. 100 or 100-200" : "Filter..."}
                        />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div
          className={styles.bodyViewport}
          style={{ height }}
          onScroll={handleScroll}
          ref={containerRef}
        >
          <div className={styles.bodySpacer} style={{ height: totalContentHeight }}>
            <div
              className={styles.bodyWindow}
              style={{ transform: `translateY(${startIndex * rowHeight}px)` }}
            >
              {visibleRows.map((row, rowOffset) => {
                const absoluteIndex = startIndex + rowOffset;
                if (isGroupRow(row)) {
                  const collapsed = collapsedGroups.has(row.key);
                  return (
                    <div
                      key={`group-${row.key}`}
                      className={styles.groupRow}
                      style={{ height: rowHeight }}
                      onClick={() => {
                        setCollapsedGroups((prev) => {
                          const next = new Set(prev);
                          if (next.has(row.key)) {
                            next.delete(row.key);
                          } else {
                            next.add(row.key);
                          }
                          return next;
                        });
                      }}
                    >
                      <span className={styles.groupChevron}>{collapsed ? "▸" : "▾"}</span>
                      <span>{row.label}</span>
                      <span className={styles.groupCount}>({row.count})</span>
                    </div>
                  );
                }

                const rowKey = getRowKey(row, absoluteIndex);
                const isSelected = selectedKeys.has(rowKey);

                return (
                  <div
                    key={rowKey}
                    className={cx(styles.row, isSelected && styles.rowSelected)}
                    style={{ height: rowHeight }}
                    onClick={() => {
                      if (rowSelection !== "checkbox") {
                        toggleRowSelected(row, absoluteIndex);
                      }
                      onRowClicked?.(row);
                    }}
                  >
                    {rowSelection === "checkbox" && (
                      <div className={cx(styles.cell, styles.checkboxCell)} style={{ width: 48, minWidth: 48 }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRowSelected(row, absoluteIndex)}
                          onClick={(event) => event.stopPropagation()}
                          aria-label={`Select row ${absoluteIndex + 1}`}
                        />
                      </div>
                    )}

                    {flattenedColumns.map((col) => {
                      const width = columnWidths[col.id] ?? 180;
                      const value = getCellValue(row, col, absoluteIndex);
                      const formatted = col.valueFormatter
                        ? col.valueFormatter({ value, row, rowIndex: absoluteIndex, column: col })
                        : defaultFormat(value);

                      const pinnedClass =
                        col.pinned === "left"
                          ? styles.pinnedLeft
                          : col.pinned === "right"
                            ? styles.pinnedRight
                            : undefined;
                      const pinnedStyle =
                        col.pinned === "left"
                          ? { left: pinnedLeftOffsets[col.id] }
                          : col.pinned === "right"
                            ? { right: pinnedRightOffsets[col.id] }
                            : undefined;

                      const isEditing = editingCell?.rowKey === rowKey && editingCell?.colId === col.id;
                      const isEditable = Boolean(col.cellEditor);

                      return (
                        <div
                          key={`${rowKey}-${col.id}`}
                          className={cx(styles.cell, pinnedClass)}
                          style={{ width, minWidth: width, ...pinnedStyle }}
                          onDoubleClick={() => {
                            if (!isEditable) {
                              return;
                            }
                            setEditingCell({ rowKey, colId: col.id });
                            setEditDraftValue(value);
                          }}
                        >
                          {isEditing ? (
                            <div className={styles.editorWrap}>
                              {col.cellEditor ? (
                                col.cellEditor({
                                  row,
                                  value: editDraftValue,
                                  rowIndex: absoluteIndex,
                                  column: col,
                                  onChange: setEditDraftValue,
                                })
                              ) : (
                                <input
                                  className={styles.editorInput}
                                  value={defaultFormat(editDraftValue)}
                                  onChange={(event) => setEditDraftValue(event.target.value)}
                                />
                              )}
                              <div className={styles.editorActions}>
                                <button
                                  type="button"
                                  className={styles.editorButton}
                                  onClick={() => commitEdit(row, absoluteIndex, col)}
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  className={styles.editorButton}
                                  onClick={() => setEditingCell(null)}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : col.cellRenderer ? (
                            col.cellRenderer({ row, value, rowIndex: absoluteIndex, column: col })
                          ) : (
                            <span className={styles.cellText}>{formatted}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {pagination && !infiniteScroll && (
        <div className={styles.pagination}>
          <button
            type="button"
            className={styles.pageButton}
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          >
            Prev
          </button>
          <span className={styles.pageMeta}>
            Page {currentPage} / {pageCount}
          </span>
          <button
            type="button"
            className={styles.pageButton}
            disabled={currentPage >= pageCount}
            onClick={() => setCurrentPage((prev) => Math.min(pageCount, prev + 1))}
          >
            Next
          </button>
        </div>
      )}

      {infiniteScroll && (
        <div className={styles.infiniteStatus}>
          {isLoadingMore ? "Loading more rows..." : hasMoreRows ? "Scroll to load more" : "All rows loaded"}
        </div>
      )}
    </div>
  );
}

export const DataGrid = forwardRef(DataGridInner) as <T extends Record<string, unknown>>(
  props: DataGridProps<T> & { ref?: React.Ref<DataGridRef> },
) => React.ReactElement;
