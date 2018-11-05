import { DragEvent, getPointer, eventsDiff } from "./utils";

export interface IDragProps {
  x: number,
  y: number,
  deltaX: number,
  deltaY: number,
  initialEvent?: DragEvent,
  initialPointer?: ReturnType<typeof getPointer>,
  lastEvent?: DragEvent,
  lastPointer?: ReturnType<typeof getPointer>,
  draggedNode?: HTMLElement
}

export class DragProperties {
  public container?: HTMLElement;
  public draggedNode?: HTMLElement;
  public lastEvent?: DragEvent;
  public initialEvent?: DragEvent;
  private maxX: number = Infinity;
  private maxY: number = Infinity;
  private minX: number = -Infinity;
  private minY: number = -Infinity;

  get initialPointer() {
    return this.initialEvent && getPointer(this.initialEvent);
  }

  get lastPointer() {
    return this.lastEvent && getPointer(this.lastEvent);
  }

  get deltaX() {
    const {initialEvent, lastEvent} = this;
    return initialEvent && lastEvent ? eventsDiff(initialEvent, lastEvent).x : 0;
  }

  get deltaY() {
    const {initialEvent, lastEvent} = this;
    return initialEvent && lastEvent ? eventsDiff(initialEvent, lastEvent).y : 0;
  }

  get x() {
    return Math.max(Math.min(this.deltaX, this.maxX), this.minX)
  }

  get y() {
    return Math.max(Math.min(this.deltaY, this.maxY), this.minY);
  }

  public clean = () => {
    this.draggedNode = undefined;
    this.initialEvent = undefined;
  }

  public fillBounds = () => {
    const { container, draggedNode } = this;
    const containerRect = container && container.getBoundingClientRect();
    const draggedRect = draggedNode && draggedNode.getBoundingClientRect();

    if (containerRect != null && draggedRect != null) {
      this.maxX = containerRect.right - draggedRect.right;
      this.minX = containerRect.left - draggedRect.left;
      this.maxY = containerRect.bottom - draggedRect.bottom;
      this.minY = containerRect.top - draggedRect.top;
    } else {
      this.maxX = this.maxY = Infinity;
      this.minX = this.minY = -Infinity;
    }
  }

  get values(): IDragProps {
    return {
      deltaX: this.deltaX,
      deltaY: this.deltaY,
      draggedNode: this.draggedNode,
      initialEvent: this.initialEvent,
      initialPointer: this.initialEvent,
      lastEvent: this.lastEvent,
      lastPointer: this.lastPointer,
      x: this.x,
      y: this.y,
    }
  }
}
