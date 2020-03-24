export const fixToRange = (v: number, min: number, max: number) => {
  if (v == null) return v;
  return Math.max(Math.min(v, max != null ? max : v), min != null ? min : v);
};
