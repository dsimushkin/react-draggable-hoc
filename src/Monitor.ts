import { findDOMNode } from "react-dom";

import { DraggableComponent, DraggableContainerComponent } from "./DraggableContainer";
import { DragEvent } from "./utils";

export type DragCallback = (monitor: DraggableMonitor) => void;

export enum CallbackEvent {
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
  draggedEl?: HTMLElement
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
    this.lastEvent = undefined;
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
      draggedEl: this.dragged,
      initialEvent: this.initialEvent,
      lastEvent: this.lastEvent,
      x: this.x,
      y: this.y,
    }
  }
}

class Callbacks {
  private monitor: DraggableMonitor;
  private events: {
    [key in CallbackEvent]: DragCallback[]
  } = {
    [CallbackEvent.beforeDragEnd]: [],
    [CallbackEvent.drag]: [],
    [CallbackEvent.dragEnd]: [],
    [CallbackEvent.dragStart]: [],
  }

  constructor(monitor: DraggableMonitor) {
    this.monitor = monitor;
  }

  public on = (event: CallbackEvent, callback: DragCallback) => {
    this.events[event].push(callback);
  }

  public off = (event: CallbackEvent, callback: DragCallback) => {
    const index = this.events[event].indexOf(callback);
    if (index >= 0) {
      this.events[event].splice(index, 1);
    }
  }

  public notify = (event: CallbackEvent) => {
    this.events[event].forEach((callback: DragCallback) => {
      callback(this.monitor);
    })
  }
}

export class DraggableMonitor {
  public container?: DraggableContainerComponent;
  public dragged?: DraggableComponent;
  public props = new DragProperties();

  private callbacks = new Callbacks(this);

  constructor(container?: DraggableContainerComponent) {
    this.container = container;
    this.props = new DragProperties();
  }

  public drag = (event: DragEvent) => {
    if (this.dragged) {
      this.props.lastEvent = event;

      this.callbacks.notify(CallbackEvent.drag);
    }
  }

  public dragEnd = () => {
    this.callbacks.notify(CallbackEvent.beforeDragEnd);
    this.clean();
    this.callbacks.notify(CallbackEvent.dragEnd);
  }

  public dragStart = (dragged: DraggableComponent, event: DragEvent) => {
    if (this.dragged === undefined && this.container != null) {
      this.dragged = dragged;

      this.props.container = findDOMNode(this.container) as HTMLElement;
      this.props.dragged = findDOMNode(dragged) as HTMLElement;
      this.props.initialEvent = event;
      this.props.lastEvent = event;

      this.callbacks.notify(CallbackEvent.dragStart);
    }
  }

  public clean = () => {
    this.props.clean();
    this.dragged = undefined;
  }

  public on = (event: CallbackEvent, callback: DragCallback) => {
    this.callbacks.on(event, callback);
  }

  public off = (event: CallbackEvent, callback: DragCallback) => {
    this.callbacks.off(event, callback);
  }
}
