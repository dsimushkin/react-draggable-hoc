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
  return ["touchstart", "mousedown"].indexOf(e.type) >= 0 && isDragEvent(e);
}

export function isDragEvent(e: DragEvent) {
  switch (e.type) {
    case "touchstart":
    case "touchmove":
    case "touchend":
      return e.touches.length === 1;
    case "mousedown":
    case "mousemove":
    case "mouseup":
      return e.buttons === 0 || e.buttons === 1;
    default:
      return false;
  }
}

export function remove<T>(arr: Array<T>, e: T) {
  const index = arr.indexOf(e);

  if (index >= 0) {
    return arr.splice(index, 1);
  }

  return undefined;
}

const id: string | undefined = undefined;
export const log = (...messages: any) => {
  if (id == null) return;
  let element = document.getElementById(id);
  if (element == null) {
    element = document.createElement("div");
    element.id = id;
    document.body.appendChild(element);
  }
  element.innerHTML = "";
  messages.forEach((e: any) => {
    element!.innerHTML += JSON.stringify(e);
  });
  console.log(...messages);
};
