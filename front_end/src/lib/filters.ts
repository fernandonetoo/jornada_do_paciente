export function matchesStatus(value: unknown, filter: string) {
  if (!filter) return true;
  return normalizeText(value) === normalizeText(filter);
}

export function matchesDateRange(value: unknown, start: string, end: string) {
  const normalized = normalizeDate(value);

  if (!normalized) {
    return !start && !end;
  }

  if (start && normalized < start) return false;
  if (end && normalized > end) return false;

  return true;
}

function normalizeText(value: unknown) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function normalizeDate(value: unknown) {
  const text = String(value || "").trim();
  if (!text || text === "-") return "";

  if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
    return text.slice(0, 10);
  }

  const brDate = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brDate) {
    const [, day, month, year] = brDate;
    return `${year}-${month}-${day}`;
  }

  return "";
}
