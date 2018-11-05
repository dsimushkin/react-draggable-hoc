import { DragEvent } from "./utils";

export interface IDragProps {
  x: number,
  y: number,
  deltaX: number,
  deltaY: number,
  initialEvent?: DragEvent,
  lastEvent?: DragEvent,
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

  get deltaX() {
    return this.initialEvent && this.lastEvent ? this.lastEvent.pageX - this.initialEvent.pageX : 0;
  }

  get deltaY() {
    return this.initialEvent && this.lastEvent ? this.lastEvent.pageY - this.initialEvent.pageY : 0;
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
      lastEvent: this.lastEvent,
      x: this.x,
      y: this.y,
    }
  }
}
