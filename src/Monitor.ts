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

  private callbacks = new Callbacks<this, DragActions>(this);

  constructor(container?: DraggableContainerComponent) {
    this.container = container;
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
      this.props.draggedNode = findDOMNode(dragged) as HTMLElement;
      this.props.initialEvent = event;
      this.props.lastEvent = event;
      this.props.fillBounds();

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
