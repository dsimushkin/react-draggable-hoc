import { findDOMNode } from "react-dom";

import { Callbacks } from "./Callbacks";
import { DraggableComponent, DraggableContainerComponent } from "./DragDropContainer";
import { DragProperties } from "./DraggableProperties";
import { DragEvent, eventsDiff } from "./utils";

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
  public cancelDrag?: (reason?: any) => void;

  private callbacks = new Callbacks<this, DragActions>(this);

  constructor(container?: DraggableContainerComponent) {
    this.container = container;
  }

  public drag = (event: DragEvent) => {
    if (this.props.initialEvent) {
      const {x, y} = eventsDiff(this.props.initialEvent, event);
      if (this.cancelDrag && (x > 0 || y > 0)) {
        this.clean();
      }
      if (this.dragged) {
        event.preventDefault();
        this.props.lastEvent = event;
        this.callbacks.notify(DragActions.drag);
      }
    }
  }

  public dragEnd = () => {
    if (this.cancelDrag) {
      this.clean();
    }
    if (this.dragged) {
      this.callbacks.notify(DragActions.beforeDragEnd);
      this.clean();
      this.callbacks.notify(DragActions.dragEnd);
    }
  }

  public dragStart = (dragged: DraggableComponent, event: DragEvent, delay: number = 0) => {
    return new Promise<boolean>((resolve, reject) => {
      if (this.dragged === undefined && this.container != null) {
        this.props.initialEvent = event;
        this.cancelDrag = reject;
        this.delay = setTimeout(() => {
          this.dragged = dragged;
          this.props.container = findDOMNode(this.container!) as HTMLElement;
          this.props.draggedNode = findDOMNode(dragged!) as HTMLElement;
          this.props.lastEvent = event;
          this.props.fillBounds();
          this.callbacks.notify(DragActions.dragStart);
          this.callbacks.notify(DragActions.drag);
          this.cancelDrag = undefined;
          this.delay = undefined;
          resolve(true);
        }, delay);
      }
    });
  }

  public clean = () => {
    if (this.delay) {
      clearTimeout(this.delay);
      this.delay = undefined;
    }

    if (this.cancelDrag) {
      this.cancelDrag("Drag cancel");
      this.cancelDrag = undefined;
    }

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
