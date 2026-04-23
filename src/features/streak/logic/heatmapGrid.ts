export const HEATMAP_NUM_WEEKS = 16;
export const HEATMAP_ROWS = 7;

function startOfWeekSunday(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  const day = c.getDay();
  c.setDate(c.getDate() - day);
  return c;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export type HeatmapCellMeta = {
  dateIso: string;
  isFuture: boolean;
};

/**
 * 16 columns (weeks) x 7 rows (Sun–Sat). Oldest week on the left.
 */
export function buildHeatmapGrid(today: Date = new Date()): {
  columns: number;
  rows: number;
  getCell: (col: number, row: number) => HeatmapCellMeta;
} {
  const t = new Date(today);
  t.setHours(0, 0, 0, 0);
  const currentWeekSun = startOfWeekSunday(t);
  const gridStart = addDays(currentWeekSun, -(HEATMAP_NUM_WEEKS - 1) * 7);

  return {
    columns: HEATMAP_NUM_WEEKS,
    rows: HEATMAP_ROWS,
    getCell(col: number, row: number) {
      const day = addDays(gridStart, col * 7 + row);
      const dateIso = day.toLocaleDateString('en-CA');
      const isFuture = day.getTime() > t.getTime();
      return { dateIso, isFuture };
    },
  };
}
