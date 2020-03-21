export type DragPhase = "dragStart" | "drag" | "drop";
export type DragListener = (e: MouseEvent | TouchEvent) => void;

export function attach(
  phase: DragPhase,
  fn: DragListener,
  node: HTMLElement | Window = window,
  config: Parameters<typeof addEventListener>[2] = { passive: false }
) {
  switch (phase) {
    case "dragStart":
      (node as HTMLElement).addEventListener("mousedown", fn, config);
      (node as HTMLElement).addEventListener("touchstart", fn, config);
      return fn;
    case "drag":
      (node as HTMLElement).addEventListener("mousemove", fn, config);
      (node as HTMLElement).addEventListener("touchmove", fn, config);
      return fn;
    case "drop":
      (node as HTMLElement).addEventListener("mouseup", fn, config);
      (node as HTMLElement).addEventListener("touchend", fn, config);
      return fn;
    default:
      throw new Error(`Invalid phase ${phase}`);
  }
}

export function detach(
  phase: DragPhase,
  fn: DragListener,
  node: HTMLElement | Window = window
) {
  switch (phase) {
    case "dragStart":
      (node as HTMLElement).removeEventListener("mousedown", fn);
      (node as HTMLElement).removeEventListener("touchstart", fn);
      return fn;
    case "drag":
      (node as HTMLElement).removeEventListener("mousemove", fn);
      (node as HTMLElement).removeEventListener("touchmove", fn);
      return fn;
    case "drop":
      (node as HTMLElement).removeEventListener("mouseup", fn);
      (node as HTMLElement).removeEventListener("touchend", fn);
      return fn;
    default:
      throw new Error(`Invalid phase ${phase}`);
  }
}

export function isDragStart(e: Event) {
  return isDragEvent(e) && ["touchstart", "mousedown"].indexOf(e.type) >= 0;
}

function isTouchEvent(e: Event) {
  return (
    (e as TouchEvent).touches != null ||
    (e as TouchEvent).changedTouches != null
  );
}

function isMouseEvent(e: Event) {
  return (e as MouseEvent).buttons != null;
}

export function isDragEvent(e: Event) {
  if (isTouchEvent(e)) {
    return (e as TouchEvent).touches.length === 1;
  }

  if (isMouseEvent(e)) {
    const { buttons } = e as MouseEvent;
    return buttons === 0 || buttons === 1;
  }

  return false;
}

export function remove<T>(arr: Array<T>, e: T) {
  const index = arr.indexOf(e);

  if (index >= 0) {
    return arr.splice(index, 1);
  }

  return undefined;
}

export const getBounds = (
  container: HTMLElement,
  rect: ClientRect | DOMRect
) => {
  if (container == null || rect == null) {
    return {
      maxX: +Infinity,
      maxY: +Infinity,
      minX: -Infinity,
      minY: -Infinity
    };
  }

  const cr = container.getBoundingClientRect();

  return {
    maxX: cr.right - rect.right,
    maxY: cr.bottom - rect.bottom,
    minX: cr.left - rect.left,
    minY: cr.top - rect.top
  };
};

export const fixToRange = (v: number, min: number, max: number) => {
  if (v == null) return v;
  return Math.max(Math.min(v, max != null ? max : v), min != null ? min : v);
};

function getPointer(event: TouchEvent) {
  return event.touches && event.touches.length
    ? event.touches[0]
    : event.changedTouches[0];
}

export function dragPayloadFactory(event: MouseEvent | TouchEvent) {
  const { pageX, pageY, target } = isTouchEvent(event)
    ? getPointer(event as TouchEvent)
    : (event as MouseEvent);
  return {
    x: pageX,
    y: pageY,
    target,
    event
  };
}
