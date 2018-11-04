import { findDOMNode } from "react-dom";

import { Callbacks } from "./Callbacks";
import { DraggableComponent, DraggableContainerComponent } from "./DraggableContainer";
import { DragEvent } from "./utils";

export enum DragActions {
  beforeDragEnd = "beforeDragEnd",
  drag = "drag",
  dragEnd = "dragEnd",
  dragStart = "dragStart",
}

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
  public lastEvent?: DragEvent;
  private maxX?: number;
  private maxY?: number;
  private minX?: number;
  private minY?: number;

  private draggedNode?: HTMLElement;
  private event?: DragEvent;

  get dragged() {
    return this.draggedNode;
  }

  set dragged(draggedNode: HTMLElement | undefined) {
    this.draggedNode = draggedNode;
    this.fillBounds();
  }

  get initialEvent() {
    return this.event;
  }

  set initialEvent(event: DragEvent | undefined) {
    this.event = event;
    this.lastEvent = event;
  }

  get deltaX() {
    return this.initialEvent && this.lastEvent ? this.lastEvent.pageX - this.initialEvent.pageX : 0;
  }

  get deltaY() {
    return this.initialEvent && this.lastEvent ? this.lastEvent.pageY - this.initialEvent.pageY : 0;
  }

  get x() {
    return Math.max(Math.min(this.deltaX, this.maxX || 0), this.minX || 0)
  }

  get y() {
    return Math.max(Math.min(this.deltaY, this.maxY || 0), this.minY || 0);
  }

  public clean = () => {
    this.dragged = undefined;
    this.event = undefined;
  }

  public fillBounds = () => {
    const { container, dragged } = this;
    const containerRect = container && container.getBoundingClientRect();
    const draggedRect = dragged && dragged.getBoundingClientRect();

    if (containerRect != null && draggedRect != null) {
      this.maxX = containerRect.right - draggedRect.right;
      this.minX = containerRect.left - draggedRect.left;
      this.maxY = containerRect.bottom - draggedRect.bottom;
      this.minY = containerRect.top - draggedRect.top;
    } else {
      this.maxX = this.minX = this.maxY = this.minY = 0;
    }
  }

  get values(): IDragProps {
    return {
      deltaX: this.deltaX,
      deltaY: this.deltaY,
      draggedNode: this.dragged,
      initialEvent: this.initialEvent,
      lastEvent: this.lastEvent,
      x: this.x,
      y: this.y,
    }
  }
}

export class DraggableMonitor {
  public container?: DraggableContainerComponent;
  public dragged?: DraggableComponent;
  public props = new DragProperties();

  private callbacks = new Callbacks<this, DragActions>(this);

  constructor(container?: DraggableContainerComponent) {
    this.container = container;
    this.props = new DragProperties();
  }

  public drag = (event: DragEvent) => {
    if (this.dragged) {
      this.props.lastEvent = event;
      this.callbacks.notify(DragActions.drag);
    }
  }

  public dragEnd = () => {
    if (this.dragged) {
      this.callbacks.notify(DragActions.beforeDragEnd);
      this.clean();
      this.callbacks.notify(DragActions.dragEnd);
    }
  }

  public dragStart = (dragged: DraggableComponent, event: DragEvent) => {
    if (this.dragged === undefined && this.container != null) {
      this.dragged = dragged;

      this.props.container = findDOMNode(this.container) as HTMLElement;
      this.props.dragged = findDOMNode(dragged) as HTMLElement;
      this.props.initialEvent = event;

      this.callbacks.notify(DragActions.dragStart);
      this.callbacks.notify(DragActions.drag);
    }
  }

  public clean = () => {
    this.props.clean();
    this.dragged = undefined;
  }

  public on = (event: DragActions, callback: (payload: this) => any) => {
    this.callbacks.on(event, callback);
  }

  public off = (event: DragActions, callback: (payload: this) => any) => {
    this.callbacks.off(event, callback);
  }
}
