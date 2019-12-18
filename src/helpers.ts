import { DragEvent } from "./DragMonitor";

export type DragPhase = "dragStart" | "drag" | "drop";
export type DragListener = (e: MouseEvent | TouchEvent) => void;

export function attach(
  phase: DragPhase,
  fn: DragListener,
  node = window,
  config = { passive: false }
) {
  switch (phase) {
    case "dragStart":
      node.addEventListener("mousedown", fn, config);
      node.addEventListener("touchstart", fn, config);
      break;
    case "drag":
      node.addEventListener("mousemove", fn, config);
      node.addEventListener("touchmove", fn, config);
      break;
    case "drop":
      node.addEventListener("mouseup", fn, config);
      node.addEventListener("touchend", fn, config);
      break;
    default:
      throw new Error(`Invalid phase ${phase}`);
  }
}

export function detach(phase: DragPhase, fn: DragListener, node = window) {
  switch (phase) {
    case "dragStart":
      node.removeEventListener("mousedown", fn);
      node.removeEventListener("touchstart", fn);
      break;
    case "drag":
      node.removeEventListener("mousemove", fn);
      node.removeEventListener("touchmove", fn);
      break;
    case "drop":
      node.removeEventListener("mouseup", fn);
      node.removeEventListener("touchend", fn);
      break;
    default:
      throw new Error(`Invalid phase ${phase}`);
  }
}

export function isDragStart(e: DragEvent) {
  return (
    (e.type === "mousedown" || e.type === "touchstart") &&
    (e.touches ? e.touches.length === 1 : e.buttons === 1)
  );
}

export function remove<T>(arr: Array<T>, e: T) {
  const index = arr.indexOf(e);

  if (index >= 0) {
    return arr.splice(index, 1);
  }

  return undefined;
}
