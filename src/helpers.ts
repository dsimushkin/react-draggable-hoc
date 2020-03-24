export const getBounds = (
  container: HTMLElement,
  rect: ClientRect | DOMRect,
) => {
  if (container == null || rect == null) {
    return {
      maxX: +Infinity,
      maxY: +Infinity,
      minX: -Infinity,
      minY: -Infinity,
    };
  }

  const cr = container.getBoundingClientRect();

  return {
    maxX: cr.right - rect.right,
    maxY: cr.bottom - rect.bottom,
    minX: cr.left - rect.left,
    minY: cr.top - rect.top,
  };
};

export const fixToRange = (v: number, min: number, max: number) => {
  if (v == null) return v;
  return Math.max(Math.min(v, max != null ? max : v), min != null ? min : v);
};
