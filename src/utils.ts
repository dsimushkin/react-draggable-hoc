import { DragStats } from "./DragHistoryReducer";

export type DragEvent = MouseEvent & TouchEvent;

export const getPointer = (event: DragEvent) => {
    return event.touches && event.touches.length
        ? event.touches[0]
        : (event.changedTouches ? event.changedTouches[0] : event);
}

export const isDragStart = (event: DragEvent) => {
    return (event.type === "mousedown" || event.type === "touchstart")
        && (event.touches ? event.touches.length === 1 : event.buttons === 1);
}

export const eventsDiff = (a: DragEvent, b: DragEvent) => {
    const aPointer = getPointer(a);
    const bPointer = getPointer(b);
    return {
        x: bPointer.pageX - aPointer.pageX,
        y: bPointer.pageY - aPointer.pageY,
    }
}

export const prevent = (e: Event) => {
    e.stopPropagation();
}

export const emptyFn = () => {}

export type HoverMethod = (nodeRef: React.RefObject<any>, dragStats: DragStats) => boolean;

export const containsPointer: HoverMethod = (nodeRef, dragStats) => {
  if (nodeRef == null
    || nodeRef.current == null
    || dragStats == null
    || dragStats.current == null
  ) {
    return false;
  }

  const {x, y} = dragStats.current;
  return document.elementsFromPoint(x, y).indexOf(nodeRef.current) >= 0;
}

export const intersects: HoverMethod = (nodeRef, dragStats) => {
  if (nodeRef == null
    || nodeRef.current == null
    || dragStats == null
    || dragStats.node == null
  ) {
    return false;
  }

  const a = nodeRef.current.getBoundingClientRect();
  const b = dragStats.node.getBoundingClientRect();

  return !(b.left > a.right
    || b.right < a.left
    || b.top > a.bottom
    || b.bottom < a.top
  );
}
