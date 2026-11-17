/** Millions with one decimal, the trailing ",0" dropped: 5300000 → "5,3", 12000000 → "12". */
export function tr(v: number) {
  const s = (v / 1_000_000).toFixed(1).replace('.', ',');
  return s.endsWith(',0') ? s.slice(0, -2) : s;
}
