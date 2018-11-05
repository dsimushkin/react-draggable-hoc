import { findDOMNode } from "react-dom";

import { Callbacks } from "./Callbacks";
import { DraggableComponent, DraggableContainerComponent } from "./DraggableContainer";
import { DragProperties } from "./DraggableProperties";
import { DragEvent } from "./utils";

export enum DragActions {
  beforeDragEnd = "beforeDragEnd",
  drag = "drag",
  dragEnd = "dragEnd",
  dragStart = "dragStart",
}

export class DragMonitor {
  public container?: DraggableContainerComponent;
  public dragged?: DraggableComponent;
  public props = new DragProperties();
  public delay?: ReturnType<typeof setTimeout>;

  private callbacks = new Callbacks<this, DragActions>(this);

  constructor(container?: DraggableContainerComponent) {
    this.container = container;
  }

  public drag = (event: DragEvent) => {
    if (this.delay) {
      this.clean();
    }
    if (this.dragged) {
      this.props.lastEvent = event;
      this.callbacks.notify(DragActions.drag);
    }
  }

  public dragEnd = () => {
    if (this.delay) {
      this.clean();
    }
    if (this.dragged) {
      this.callbacks.notify(DragActions.beforeDragEnd);
      this.clean();
      this.callbacks.notify(DragActions.dragEnd);
    }
  }

  public dragStart = async (dragged: DraggableComponent, event: DragEvent, delay: number = 0) => {
    return new Promise((resolve, reject) => {
      let resolved = false;
      if (this.dragged === undefined && this.container != null) {
        this.delay = setTimeout(() => {
          this.dragged = dragged;
          this.props.container = findDOMNode(this.container!) as HTMLElement;
          this.props.draggedNode = findDOMNode(dragged!) as HTMLElement;
          this.props.initialEvent = event;
          this.props.lastEvent = event;
          this.props.fillBounds();
          this.callbacks.notify(DragActions.dragStart);
          this.callbacks.notify(DragActions.drag);
          this.delay = undefined;
          resolved = true;
          resolve(true);
        }, delay);
      }
      setTimeout(() => !resolved && resolve(false), delay + 1);
    });
  }

  public clean = () => {
    if (this.delay) {
      clearTimeout(this.delay);
    }
    this.delay = undefined;
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
