import { remove, getBounds, fixToRange, dragPayloadFactory } from "./helpers";
import PubSub from "./PubSub";

export type Listener = (monitor: DragMonitor, node?: HTMLElement) => void;

export interface DragMonitorEvent {
  pageX: number;
  pageY: number;
  target: HTMLElement;
  event: Event;
}

export type DragMonitorPhase =
  | "dragStart"
  | "drag"
  | "cancel"
  | "drop"
  | "over"
  | "out";

/**
 * DragMonitor
 */
export class DragMonitor extends PubSub<DragMonitorPhase, Listener> {
  history: ReturnType<typeof dragPayloadFactory>[] = [];
  dragProps: any = undefined;
  hovered: HTMLElement[] = [];

  start = async (...e: Parameters<typeof dragPayloadFactory>) => {
    this.history = [dragPayloadFactory(...e)];
    this.notify("dragStart");
  };

  drag = async (...e: Parameters<typeof dragPayloadFactory>) => {
    this.history.push(dragPayloadFactory(...e));
    this.notify("drag");
  };

  drop = async () => {
    this.history = [];
    this.dragProps = undefined;
    this.notify("drop");
  };

  cancel = async () => {
    this.history = [];
    this.dragProps = undefined;
    this.notify("cancel");
  };

  over = (node: HTMLElement) => {
    if (this.hovered.indexOf(node) < 0) {
      this.hovered.push(node);
      this.notify("over", node);
    }
  };

  out = (node: HTMLElement) => {
    if (remove(this.hovered, node)) {
      this.notify("out", node);
    }
  };

  getDeltas = (container: HTMLElement, rect: ClientRect | DOMRect) => {
    const bounds = getBounds(container, rect);

    return {
      deltaX: fixToRange(this.deltaX, bounds.minX, bounds.maxX),
      deltaY: fixToRange(this.deltaY, bounds.minY, bounds.maxY)
    };
  };

  get initial() {
    return this.history.length ? this.history[0] : undefined;
  }

  get current() {
    return this.history.length
      ? this.history[this.history.length - 1]
      : undefined;
  }

  get deltaX() {
    return this.history.length < 2 ? 0 : this.current!.x - this.initial!.x;
  }

  get deltaY() {
    return this.history.length < 2 ? 0 : this.current!.y - this.initial!.y;
  }
}
