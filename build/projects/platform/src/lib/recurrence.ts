/**
 * Minimal iCal RRULE expander — just enough for the recurring study blocks
 * seeded by scripts/seed-plan.ts (weekly cadence with BYDAY + UNTIL).
 *
 * Supported: FREQ=WEEKLY, BYDAY, INTERVAL, UNTIL. Anything else (or an
 * unparseable rule) falls back to the single anchor occurrence, so an
 * unexpected rule can never hide an event entirely.
 */

const DAY_CODES: Record<string, number> = {
  SU: 0,
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6,
};

type ParsedRule = {
  freq: string;
  interval: number;
  byDays: number[];
  until: Date | null;
};

/** Parse an "YYYYMMDDTHHMMSSZ" / "YYYYMMDD" UNTIL token into a Date. */
function parseUntil(raw: string): Date | null {
  const m = raw.match(
    /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/
  );
  if (!m) {
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const [, y, mo, d, hh = "23", mm = "59", ss = "59", z] = m;
  const year = +y;
  const monthIdx = +mo - 1;
  const day = +d;
  const hour = +hh;
  const min = +mm;
  const sec = +ss;
  return z
    ? new Date(Date.UTC(year, monthIdx, day, hour, min, sec))
    : new Date(year, monthIdx, day, hour, min, sec);
}

function parseRule(rule: string): ParsedRule | null {
  const parts = rule
    .replace(/^RRULE:/i, "")
    .split(";")
    .map((p) => p.trim())
    .filter(Boolean);
  const map: Record<string, string> = {};
  for (const p of parts) {
    const [k, v] = p.split("=");
    if (k && v) map[k.toUpperCase()] = v;
  }
  if (!map.FREQ) return null;
  const byDays = (map.BYDAY ?? "")
    .split(",")
    .map((c) => DAY_CODES[c.trim().toUpperCase()])
    .filter((n): n is number => n !== undefined);
  return {
    freq: map.FREQ.toUpperCase(),
    interval: Math.max(1, parseInt(map.INTERVAL ?? "1", 10) || 1),
    byDays,
    until: map.UNTIL ? parseUntil(map.UNTIL) : null,
  };
}

/** Midnight (local) for a date, for whole-day comparisons. */
function dayStart(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Whole weeks between two dates, counting from each week's Sunday. */
function weekIndex(anchor: Date, day: Date): number {
  const a = dayStart(anchor);
  a.setDate(a.getDate() - a.getDay()); // back to Sunday
  const b = dayStart(day);
  b.setDate(b.getDate() - b.getDay());
  return Math.round((b.getTime() - a.getTime()) / (7 * 86_400_000));
}

export type RecurringEvent = {
  startTime: string | null;
  recurrenceRule?: string | null;
};

/**
 * Expand an event into its occurrence start-times that fall within
 * [rangeStart, rangeEnd] (inclusive). Non-recurring events yield their single
 * anchor if it lands in range. Occurrences preserve the anchor's time-of-day.
 */
export function expandOccurrences(
  event: RecurringEvent,
  rangeStart: Date,
  rangeEnd: Date
): Date[] {
  if (!event.startTime) return [];
  const anchor = new Date(event.startTime);
  if (Number.isNaN(anchor.getTime())) return [];

  const rule = event.recurrenceRule ? parseRule(event.recurrenceRule) : null;

  // No/unknown recurrence → single occurrence if inside the window.
  if (!rule || rule.freq !== "WEEKLY") {
    return anchor >= rangeStart && anchor <= rangeEnd ? [anchor] : [];
  }

  const byDays = rule.byDays.length ? rule.byDays : [anchor.getDay()];
  const anchorDay = dayStart(anchor);
  const out: Date[] = [];

  // Scan each day in the visible window (a month is ~42 cells — cheap).
  const cursor = new Date(Math.max(dayStart(rangeStart).getTime(), anchorDay.getTime()));
  const end = dayStart(rangeEnd);
  for (; cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    if (!byDays.includes(cursor.getDay())) continue;
    if (rule.interval > 1 && weekIndex(anchor, cursor) % rule.interval !== 0) {
      continue;
    }
    const occ = new Date(
      cursor.getFullYear(),
      cursor.getMonth(),
      cursor.getDate(),
      anchor.getHours(),
      anchor.getMinutes(),
      anchor.getSeconds()
    );
    if (rule.until && occ > rule.until) break;
    out.push(occ);
  }
  return out;
}
