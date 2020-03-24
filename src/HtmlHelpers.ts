export type DndEvent = MouseEvent | TouchEvent;
export type DragPhase = "dragStart" | "drag" | "drop";
export type DndEventListener = (e: DndEvent) => void;

export function getSelection() {
  return window.getSelection()?.toString();
}

export function attach(
  phase: DragPhase,
  fn: DndEventListener,
  node: HTMLElement | Window = window,
  config: Parameters<typeof addEventListener>[2] = { passive: false },
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
