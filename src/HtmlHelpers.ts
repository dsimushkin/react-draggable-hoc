import { fixToRange } from "./helpers";

export type DndEvent = MouseEvent | TouchEvent;
export type DragPhase = "dragStart" | "drag" | "drop";
export type DndEventListener = (e: DndEvent) => void;
export type AsyncDndEventListener = (e: DndEvent) => Promise<void>;

export function getSelection() {
  return window.getSelection()!.toString();
}

export function clearSelection() {
  if (window.getSelection) {
    if (window.getSelection()!.empty) {
      // Chrome
      window.getSelection()!.empty();
    } else if (window.getSelection()!.removeAllRanges) {
      // Firefox
      window.getSelection()!.removeAllRanges();
    }
  } else if ((document as any).selection) {
    // IE?
    (document as any).selection.empty();
  }
}

export function attach(
  phase: DragPhase,
  fn: DndEventListener,
  node: HTMLElement | Window = window,
  config?: Parameters<typeof addEventListener>[2],
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
  fn: DndEventListener,
  node: HTMLElement | Window = window,
  config?: Parameters<typeof removeEventListener>[2],
) {
  switch (phase) {
    case "dragStart":
      (node as HTMLElement).removeEventListener("mousedown", fn, config);
      (node as HTMLElement).removeEventListener("touchstart", fn, config);
      return fn;
    case "drag":
      (node as HTMLElement).removeEventListener("mousemove", fn, config);
      (node as HTMLElement).removeEventListener("touchmove", fn, config);
      return fn;
    case "drop":
      (node as HTMLElement).removeEventListener("mouseup", fn, config);
      (node as HTMLElement).removeEventListener("touchend", fn, config);
      return fn;
    default:
      throw new Error(`Invalid phase ${phase}`);
  }
}

export function isDragStart(e: Event) {
  return isDragEvent(e) && ["touchstart", "mousedown"].indexOf(e.type) >= 0;
}

export function isTouchEvent(e: Event) {
  return (
    (e as TouchEvent).touches != null ||
    (e as TouchEvent).changedTouches != null
  );
}

export function isMouseEvent(e: Event) {
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

export function getPointer(event: TouchEvent) {
  return event.touches && event.touches.length
    ? event.touches[0]
    : event.changedTouches[0];
}

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

export const getDeltas = (
  container: HTMLElement,
  rect: ClientRect | DOMRect,
  deltaX: number,
  deltaY: number,
) => {
  const bounds = getBounds(container, rect);

  return {
    deltaX: fixToRange(deltaX, bounds.minX, bounds.maxX),
    deltaY: fixToRange(deltaY, bounds.minY, bounds.maxY),
  };
};
