export {
  DragDropContainer,
  DragMonitor,
  IDraggablePropTypes,
  IDroppableProps,
  IDroppablePropTypes,
  Draggable,
  DraggableArea,
  IDragProps,
  IDragEvent as IDragHistoryEvent,
  Droppable,
} from "./internals";

export const containsPoint = (node: HTMLElement, {x, y}: {x: number, y: number}) => {
    return document.elementsFromPoint(x, y).indexOf(node) >= 0;
}

export const intersect = (nodea: HTMLElement, nodeb: HTMLElement) => {
    const a = nodea.getBoundingClientRect();
    const b = nodeb.getBoundingClientRect();

    return !(b.left > a.right
        || b.right < a.left
        || b.top > a.bottom
        || b.bottom < a.top
    );
}
