import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import styles from "./Chart.module.css";
import { cx } from "../shared";

export type ChartType = "line" | "bar" | "pie" | "area" | "scatter";
type Orientation = "vertical" | "horizontal";
type LegendLayout = "horizontal" | "vertical";
type BarMode = "grouped" | "stacked";

export interface ChartSeries<T extends Record<string, unknown>> {
  dataKey: keyof T | string;
  name: string;
  color?: string;
  strokeWidth?: number;
  hidden?: boolean;
  xKey?: keyof T | string;
  yKey?: keyof T | string;
  sizeKey?: keyof T | string;
  colorKey?: keyof T | string;
}

export interface AxisConfig {
  dataKey?: string;
  label?: string;
  tickCount?: number;
  tickFormat?: (value: number | string) => string;
  min?: number;
  max?: number;
}

export interface GridConfig {
  horizontal?: boolean;
  vertical?: boolean;
}

export interface TooltipPayload {
  type: ChartType;
  seriesName: string;
  xValue: string | number;
  yValue: string | number;
  color: string;
  datum: Record<string, unknown>;
}

export interface ChartProps<T extends Record<string, unknown>> {
  type: ChartType;
  data: T[];
  series: Array<ChartSeries<T>>;
  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
  height?: number;
  aspectRatio?: number;
  colors?: string[];
  animate?: boolean;
  showLegend?: boolean;
  legendLayout?: LegendLayout;
  showTooltip?: boolean;
  tooltipRenderer?: (payload: TooltipPayload) => React.ReactNode;
  orientation?: Orientation;
  barMode?: BarMode;
  barGap?: number;
  donutCutout?: number;
  smooth?: boolean;
  showPoints?: boolean;
  grid?: GridConfig;
  className?: string;
}

interface Bounds {
  min: number;
  max: number;
}

interface Point {
  x: number;
  y: number;
  rawX: number | string;
  rawY: number;
  datum: Record<string, unknown>;
}

interface TooltipState {
  x: number;
  y: number;
  payload: TooltipPayload;
}

const DEFAULT_COLORS = [
  "var(--color-accent)",
  "var(--color-success)",
  "var(--color-warning)",
  "var(--color-error)",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
  "#84cc16",
];

const MARGIN = { top: 24, right: 24, bottom: 44, left: 56 };

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function toNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return 0;
}

function getRecordValue(record: Record<string, unknown>, key: string | undefined): unknown {
  if (!key) {
    return undefined;
  }
  return record[key];
}

function formatValue(value: number | string): string {
  if (typeof value === "number") {
    if (Number.isInteger(value)) {
      return value.toString();
    }
    return value.toFixed(2);
  }
  return String(value);
}

function createTicks(min: number, max: number, tickCount: number): number[] {
  if (tickCount <= 1 || min === max) {
    return [min];
  }

  const step = (max - min) / (tickCount - 1);
  return Array.from({ length: tickCount }, (_, idx) => min + step * idx);
}

function buildLinePath(points: Point[], smooth: boolean): string {
  if (points.length === 0) {
    return "";
  }

  if (!smooth || points.length < 3) {
    return points
      .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
      .join(" ");
  }

  let path = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;

  for (let index = 1; index < points.length; index += 1) {
    const current = points[index];
    const previous = points[index - 1];
    const controlX = (previous.x + current.x) / 2;

    path += ` C ${controlX.toFixed(2)} ${previous.y.toFixed(2)}, ${controlX.toFixed(2)} ${current.y.toFixed(2)}, ${current.x.toFixed(2)} ${current.y.toFixed(2)}`;
  }

  return path;
}

function buildAreaPath(points: Point[], baselineY: number, smooth: boolean): string {
  if (points.length === 0) {
    return "";
  }

  const line = buildLinePath(points, smooth);
  const first = points[0];
  const last = points[points.length - 1];

  return `${line} L ${last.x.toFixed(2)} ${baselineY.toFixed(2)} L ${first.x.toFixed(2)} ${baselineY.toFixed(2)} Z`;
}

function getNumericBounds<T extends Record<string, unknown>>(
  data: T[],
  series: Array<ChartSeries<T>>,
  mode: ChartType,
  barMode: BarMode,
  visibleKeys: Set<string>,
  axis: AxisConfig | undefined,
): Bounds {
  if (data.length === 0 || series.length === 0) {
    return { min: 0, max: 1 };
  }

  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;

  if (mode === "bar" && barMode === "stacked") {
    for (const row of data) {
      let stackedTotal = 0;
      for (const entry of series) {
        const key = String(entry.dataKey);
        if (!visibleKeys.has(key)) {
          continue;
        }
        stackedTotal += toNumber(getRecordValue(row, key));
      }
      min = Math.min(min, stackedTotal, 0);
      max = Math.max(max, stackedTotal);
    }
  }

  for (const row of data) {
    for (const entry of series) {
      const key = String(entry.dataKey);
      if (!visibleKeys.has(key)) {
        continue;
      }
      if (mode === "scatter") {
        const yKey = String(entry.yKey ?? entry.dataKey);
        const yValue = toNumber(getRecordValue(row, yKey));
        min = Math.min(min, yValue);
        max = Math.max(max, yValue);
        continue;
      }

      const value = toNumber(getRecordValue(row, key));
      min = Math.min(min, value);
      max = Math.max(max, value);
    }
  }

  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    min = 0;
    max = 1;
  }

  if (min === max) {
    const bump = min === 0 ? 1 : Math.abs(min * 0.1);
    min -= bump;
    max += bump;
  }

  if (axis?.min !== undefined) {
    min = axis.min;
  }
  if (axis?.max !== undefined) {
    max = axis.max;
  }

  return { min, max };
}

function useContainerSize(targetHeight: number | undefined, aspectRatio: number | undefined) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }
      setWidth(entry.contentRect.width);
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const resolvedHeight = useMemo(() => {
    if (targetHeight !== undefined) {
      return targetHeight;
    }
    if (aspectRatio && aspectRatio > 0 && width > 0) {
      return width / aspectRatio;
    }
    return 320;
  }, [aspectRatio, targetHeight, width]);

  return { ref, width, height: resolvedHeight };
}

function DefaultTooltip({ payload }: { payload: TooltipPayload }) {
  return (
    <div className={styles.tooltipCard}>
      <strong>{payload.seriesName}</strong>
      <span>X: {formatValue(payload.xValue)}</span>
      <span>Y: {formatValue(payload.yValue)}</span>
    </div>
  );
}

export function Chart<T extends Record<string, unknown>>({
  type,
  data,
  series,
  xAxis,
  yAxis,
  height,
  aspectRatio,
  colors = DEFAULT_COLORS,
  animate = true,
  showLegend = true,
  legendLayout = "horizontal",
  showTooltip = true,
  tooltipRenderer,
  orientation = "vertical",
  barMode = "grouped",
  barGap = 8,
  donutCutout = 0,
  smooth = true,
  showPoints = true,
  grid,
  className,
}: ChartProps<T>) {
  const { ref, width, height: measuredHeight } = useContainerSize(height, aspectRatio);
  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const entry of series) {
      if (entry.hidden) {
        initial.add(String(entry.dataKey));
      }
    }
    return initial;
  });
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const chartId = useId().replace(/:/g, "");
  const svgWidth = Math.max(width, 1);
  const svgHeight = Math.max(measuredHeight, 220);

  const plot = {
    x: MARGIN.left,
    y: MARGIN.top,
    width: Math.max(svgWidth - MARGIN.left - MARGIN.right, 1),
    height: Math.max(svgHeight - MARGIN.top - MARGIN.bottom, 1),
  };

  const palette = useMemo(() => {
    if (colors.length > 0) {
      return colors;
    }
    return DEFAULT_COLORS;
  }, [colors]);

  const visibleSeries = useMemo(
    () => series.filter((entry) => !hiddenKeys.has(String(entry.dataKey))),
    [hiddenKeys, series],
  );

  const visibleKeys = useMemo(() => {
    const next = new Set<string>();
    for (const item of visibleSeries) {
      next.add(String(item.dataKey));
    }
    return next;
  }, [visibleSeries]);

  const yBounds = useMemo(
    () => getNumericBounds(data, series, type, barMode, visibleKeys, yAxis),
    [barMode, data, series, type, visibleKeys, yAxis],
  );

  const defaultGrid = { horizontal: true, vertical: false, ...grid };
  const yTicks = useMemo(() => createTicks(yBounds.min, yBounds.max, yAxis?.tickCount ?? 5), [yAxis?.tickCount, yBounds.max, yBounds.min]);

  const xKey = xAxis?.dataKey;
  const xValues = useMemo(() => {
    if (!xKey) {
      return data.map((_, index) => index);
    }
    return data.map((row) => {
      const value = getRecordValue(row, xKey);
      if (typeof value === "number" || typeof value === "string") {
        return value;
      }
      return String(value ?? "");
    });
  }, [data, xKey]);

  const categoryCount = Math.max(data.length, 1);
  const categoryStep = plot.width / categoryCount;

  const yScale = (value: number): number => {
    const ratio = (value - yBounds.min) / (yBounds.max - yBounds.min);
    return plot.y + plot.height - ratio * plot.height;
  };

  const xCategoryCenter = (index: number): number => plot.x + categoryStep * index + categoryStep / 2;

  const xLinearBounds = useMemo(() => {
    if (type !== "scatter") {
      return { min: 0, max: 1 };
    }

    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    for (const row of data) {
      for (const entry of visibleSeries) {
        const key = String(entry.xKey ?? xAxis?.dataKey ?? "");
        if (!key) {
          continue;
        }
        const value = toNumber(getRecordValue(row, key));
        min = Math.min(min, value);
        max = Math.max(max, value);
      }
    }

    if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
      return { min: 0, max: 1 };
    }

    return { min, max };
  }, [data, type, visibleSeries, xAxis?.dataKey]);

  const xLinearScale = (value: number): number => {
    const ratio = (value - xLinearBounds.min) / (xLinearBounds.max - xLinearBounds.min);
    return plot.x + ratio * plot.width;
  };

  const horizontalValueScale = (value: number): number => {
    const ratio = (value - yBounds.min) / (yBounds.max - yBounds.min);
    return plot.x + ratio * plot.width;
  };

  const pointGroups = useMemo(() => {
    return visibleSeries.map((entry, seriesIndex) => {
      const key = String(entry.dataKey);
      const linePoints: Point[] = data.map((row, rowIndex) => {
        const xValue = xValues[rowIndex] ?? rowIndex;
        const yValue = type === "scatter" ? toNumber(getRecordValue(row, String(entry.yKey ?? key))) : toNumber(getRecordValue(row, key));

        const xCoord =
          type === "scatter"
            ? xLinearScale(toNumber(getRecordValue(row, String(entry.xKey ?? xAxis?.dataKey ?? ""))))
            : xCategoryCenter(rowIndex);

        return {
          x: xCoord,
          y: yScale(yValue),
          rawX: xValue,
          rawY: yValue,
          datum: row,
        };
      });

      return {
        entry,
        color: entry.color ?? palette[seriesIndex % palette.length],
        points: linePoints,
      };
    });
  }, [data, palette, type, visibleSeries, xAxis?.dataKey, xCategoryCenter, xLinearScale, xValues, yScale]);

  const toggleSeries = (key: string) => {
    setHiddenKeys((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const axisLabelX = xAxis?.label;
  const axisLabelY = yAxis?.label;

  const buildTooltipPayload = (
    entry: ChartSeries<T>,
    color: string,
    rawX: string | number,
    rawY: number,
    datum: Record<string, unknown>,
  ): TooltipPayload => ({
    type,
    seriesName: entry.name,
    xValue: rawX,
    yValue: rawY,
    color,
    datum,
  });

  const onDataLeave = () => {
    setTooltip(null);
  };

  const renderTooltip = () => {
    if (!showTooltip || !tooltip) {
      return null;
    }

    return (
      <div
        className={styles.tooltip}
        style={{ left: clamp(tooltip.x + 12, 0, svgWidth - 220), top: clamp(tooltip.y - 12, 0, svgHeight - 120) }}
      >
        {tooltipRenderer ? tooltipRenderer(tooltip.payload) : <DefaultTooltip payload={tooltip.payload} />}
      </div>
    );
  };

  const renderLegend = () => {
    if (!showLegend || series.length === 0) {
      return null;
    }

    return (
      <div className={cx(styles.legend, legendLayout === "vertical" && styles.legendVertical)}>
        {series.map((entry, index) => {
          const key = String(entry.dataKey);
          const isHidden = hiddenKeys.has(key);
          const color = entry.color ?? palette[index % palette.length];

          return (
            <button
              type="button"
              key={key}
              className={cx(styles.legendItem, isHidden && styles.legendItemHidden)}
              onClick={() => toggleSeries(key)}
            >
              <span className={styles.legendSwatch} style={{ background: color }} />
              <span>{entry.name}</span>
            </button>
          );
        })}
      </div>
    );
  };

  const renderAxes = () => {
    if (type === "pie") {
      return null;
    }

    return (
      <>
        <line x1={plot.x} y1={plot.y + plot.height} x2={plot.x + plot.width} y2={plot.y + plot.height} className={styles.axis} />
        <line x1={plot.x} y1={plot.y} x2={plot.x} y2={plot.y + plot.height} className={styles.axis} />

        {defaultGrid.horizontal &&
          yTicks.map((tick) => {
            const y = yScale(tick);
            return (
              <line
                key={`grid-y-${tick}`}
                x1={plot.x}
                y1={y}
                x2={plot.x + plot.width}
                y2={y}
                className={styles.gridLine}
              />
            );
          })}

        {defaultGrid.vertical &&
          data.map((_, index) => {
            const x = xCategoryCenter(index);
            return (
              <line key={`grid-x-${index}`} x1={x} y1={plot.y} x2={x} y2={plot.y + plot.height} className={styles.gridLine} />
            );
          })}

        {yTicks.map((tick) => {
          const y = yScale(tick);
          const label = yAxis?.tickFormat ? yAxis.tickFormat(tick) : formatValue(tick);

          return (
            <text key={`tick-y-${tick}`} x={plot.x - 10} y={y + 4} className={styles.tickLabel} textAnchor="end">
              {label}
            </text>
          );
        })}

        {xValues.map((tick, index) => {
          const x = type === "scatter" ? xLinearScale(typeof tick === "number" ? tick : Number(index)) : xCategoryCenter(index);
          const label = xAxis?.tickFormat ? xAxis.tickFormat(tick) : formatValue(tick);

          return (
            <text
              key={`tick-x-${index}`}
              x={x}
              y={plot.y + plot.height + 22}
              className={styles.tickLabel}
              textAnchor="middle"
            >
              {label}
            </text>
          );
        })}

        {axisLabelX && (
          <text x={plot.x + plot.width / 2} y={svgHeight - 8} textAnchor="middle" className={styles.axisLabel}>
            {axisLabelX}
          </text>
        )}

        {axisLabelY && (
          <text
            x={14}
            y={plot.y + plot.height / 2}
            textAnchor="middle"
            className={styles.axisLabel}
            transform={`rotate(-90 14 ${plot.y + plot.height / 2})`}
          >
            {axisLabelY}
          </text>
        )}
      </>
    );
  };

  const barAreaWidth = plot.width / Math.max(data.length, 1);

  const renderBarSeries = () => {
    const seriesCount = Math.max(visibleSeries.length, 1);
    const groupBand = Math.max(barAreaWidth - barGap, 1);
    const barWidth = barMode === "stacked" ? groupBand : Math.max(groupBand / seriesCount, 1);

    return pointGroups.map(({ entry, points, color }, seriesIndex) => {
      let stackedOffset = 0;

      return (
        <g key={String(entry.dataKey)}>
          {points.map((point, index) => {
            const value = point.rawY;
            const valueY = yScale(value + (barMode === "stacked" ? stackedOffset : 0));
            const zeroY = yScale(barMode === "stacked" ? stackedOffset : 0);
            const rectHeight = Math.abs(zeroY - valueY);
            const xBase = plot.x + index * barAreaWidth + barGap / 2;
            const x =
              orientation === "horizontal"
                ? plot.x
                : barMode === "stacked"
                  ? xBase
                  : xBase + seriesIndex * barWidth;
            const y = orientation === "horizontal" ? plot.y + index * (plot.height / Math.max(data.length, 1)) : Math.min(zeroY, valueY);
            const width = orientation === "horizontal" ? Math.abs(horizontalValueScale(value) - plot.x) : barWidth;
            const heightValue = orientation === "horizontal" ? Math.max((plot.height / Math.max(data.length, 1)) - barGap / 2, 2) : rectHeight;

            if (barMode === "stacked") {
              stackedOffset += value;
            }

            return (
              <rect
                key={`${String(entry.dataKey)}-${index}`}
                x={x}
                y={y}
                width={Math.max(width, 0)}
                height={Math.max(heightValue, 0)}
                fill={color}
                rx={4}
                className={cx(styles.geometry, animate && styles.geometryAnimated)}
                onMouseMove={(event) => {
                  if (!showTooltip) {
                    return;
                  }
                  const rect = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
                  if (!rect) {
                    return;
                  }
                  setTooltip({
                    x: event.clientX - rect.left,
                    y: event.clientY - rect.top,
                    payload: buildTooltipPayload(entry, color, point.rawX, point.rawY, point.datum),
                  });
                }}
                onMouseLeave={onDataLeave}
              />
            );
          })}
        </g>
      );
    });
  };

  const renderLineSeries = (isArea: boolean) => {
    return pointGroups.map(({ entry, points, color }) => {
      const linePath = buildLinePath(points, smooth);
      const areaPath = buildAreaPath(points, yScale(0), smooth);

      return (
        <g key={String(entry.dataKey)}>
          {isArea && (
            <path
              d={areaPath}
              fill={`url(#${chartId}-area-${String(entry.dataKey)})`}
              className={cx(styles.geometry, animate && styles.geometryAnimated)}
            />
          )}
          <path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth={entry.strokeWidth ?? 2.5}
            className={cx(styles.geometry, animate && styles.geometryAnimated)}
          />
          {showPoints &&
            points.map((point, index) => (
              <circle
                key={`${String(entry.dataKey)}-${index}`}
                cx={point.x}
                cy={point.y}
                r={4}
                fill={color}
                className={cx(styles.geometry, animate && styles.geometryAnimated)}
                onMouseMove={(event) => {
                  if (!showTooltip) {
                    return;
                  }
                  const rect = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
                  if (!rect) {
                    return;
                  }
                  setTooltip({
                    x: event.clientX - rect.left,
                    y: event.clientY - rect.top,
                    payload: buildTooltipPayload(entry, color, point.rawX, point.rawY, point.datum),
                  });
                }}
                onMouseLeave={onDataLeave}
              />
            ))}
        </g>
      );
    });
  };

  const renderScatter = () => {
    return pointGroups.map(({ entry, points, color }) => {
      const sizeKey = entry.sizeKey ? String(entry.sizeKey) : undefined;
      const colorKey = entry.colorKey ? String(entry.colorKey) : undefined;

      return (
        <g key={String(entry.dataKey)}>
          {points.map((point, index) => {
            const rawSize = sizeKey ? toNumber(getRecordValue(point.datum, sizeKey)) : 0;
            const radius = 4 + clamp(rawSize / 12, 0, 12);
            const fill =
              colorKey && typeof getRecordValue(point.datum, colorKey) === "string"
                ? String(getRecordValue(point.datum, colorKey))
                : color;

            return (
              <circle
                key={`${String(entry.dataKey)}-${index}`}
                cx={point.x}
                cy={point.y}
                r={radius}
                fill={fill}
                fillOpacity={0.8}
                className={cx(styles.geometry, animate && styles.geometryAnimated)}
                onMouseMove={(event) => {
                  if (!showTooltip) {
                    return;
                  }
                  const rect = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
                  if (!rect) {
                    return;
                  }
                  setTooltip({
                    x: event.clientX - rect.left,
                    y: event.clientY - rect.top,
                    payload: buildTooltipPayload(entry, fill, point.rawX, point.rawY, point.datum),
                  });
                }}
                onMouseLeave={onDataLeave}
              />
            );
          })}
        </g>
      );
    });
  };

  const renderPie = () => {
    if (data.length === 0 || visibleSeries.length === 0) {
      return null;
    }

    const radius = Math.min(plot.width, plot.height) / 2 - 8;
    const innerRadius = clamp(radius * donutCutout, 0, radius - 2);
    const centerX = plot.x + plot.width / 2;
    const centerY = plot.y + plot.height / 2;

    const firstSeries = visibleSeries[0];
    const valueKey = String(firstSeries.dataKey);
    const labelKey = xAxis?.dataKey;

    const values = data.map((row) => Math.max(toNumber(getRecordValue(row, valueKey)), 0));
    const total = values.reduce((sum, value) => sum + value, 0);

    if (total <= 0) {
      return null;
    }

    let angleStart = -Math.PI / 2;

    return data.map((row, index) => {
      const value = values[index];
      const fraction = value / total;
      const angleEnd = angleStart + fraction * Math.PI * 2;

      const x1 = centerX + radius * Math.cos(angleStart);
      const y1 = centerY + radius * Math.sin(angleStart);
      const x2 = centerX + radius * Math.cos(angleEnd);
      const y2 = centerY + radius * Math.sin(angleEnd);
      const largeArc = angleEnd - angleStart > Math.PI ? 1 : 0;

      const ix1 = centerX + innerRadius * Math.cos(angleStart);
      const iy1 = centerY + innerRadius * Math.sin(angleStart);
      const ix2 = centerX + innerRadius * Math.cos(angleEnd);
      const iy2 = centerY + innerRadius * Math.sin(angleEnd);

      const color = palette[index % palette.length];
      const path =
        innerRadius > 0
          ? `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1} Z`
          : `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

      const labelAngle = angleStart + (angleEnd - angleStart) / 2;
      const labelX = centerX + (innerRadius + (radius - innerRadius) * 0.56) * Math.cos(labelAngle);
      const labelY = centerY + (innerRadius + (radius - innerRadius) * 0.56) * Math.sin(labelAngle);

      const labelRaw = labelKey ? getRecordValue(row, labelKey) : `Segment ${index + 1}`;
      const label = typeof labelRaw === "number" || typeof labelRaw === "string" ? labelRaw : String(labelRaw ?? "");

      const payload = buildTooltipPayload(firstSeries, color, label, value, row);

      angleStart = angleEnd;

      return (
        <g key={`pie-${index}`}>
          <path
            d={path}
            fill={color}
            className={cx(styles.geometry, animate && styles.geometryAnimated)}
            onMouseMove={(event) => {
              if (!showTooltip) {
                return;
              }
              const rect = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
              if (!rect) {
                return;
              }
              setTooltip({
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
                payload,
              });
            }}
            onMouseLeave={onDataLeave}
          />
          <text x={labelX} y={labelY} textAnchor="middle" dominantBaseline="middle" className={styles.pieLabel}>
            {formatValue(label)}
          </text>
        </g>
      );
    });
  };

  const renderGeometry = () => {
    if (type === "pie") {
      return renderPie();
    }
    if (type === "bar") {
      return renderBarSeries();
    }
    if (type === "line") {
      return renderLineSeries(false);
    }
    if (type === "area") {
      return renderLineSeries(true);
    }
    return renderScatter();
  };

  return (
    <div className={cx(styles.root, className)} ref={ref}>
      {renderLegend()}
      <div className={styles.canvasWrap}>
        <svg width="100%" height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} role="img" aria-label={`${type} chart`}>
          <defs>
            {pointGroups.map(({ entry, color }) => (
              <linearGradient key={`grad-${String(entry.dataKey)}`} id={`${chartId}-area-${String(entry.dataKey)}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.5} />
                <stop offset="100%" stopColor={color} stopOpacity={0.06} />
              </linearGradient>
            ))}
          </defs>
          {renderAxes()}
          {renderGeometry()}
        </svg>
        {renderTooltip()}
      </div>
    </div>
  );
}
