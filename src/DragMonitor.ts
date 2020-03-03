import { remove } from "./helpers";

export type DragEvent = MouseEvent & TouchEvent;
export type Listener = (monitor: DragMonitor, node?: HTMLElement) => void;

function getPointer(event: DragEvent) {
  return event.touches && event.touches.length
    ? event.touches[0]
    : event.changedTouches
    ? event.changedTouches[0]
    : event;
}

function dragPayloadFactory(event: DragEvent) {
  const { pageX, pageY, target } = getPointer(event);
  return {
    x: pageX,
    y: pageY,
    target,
    event
  };
}

export type DragMonitorEvents =
  | "dragStart"
  | "propsChange"
  | "drag"
  | "drop"
  | "over"
  | "out";

/**
 * DragMonitor
 */
export class DragMonitor {
  subs: {
    [key in DragMonitorEvents]: Listener[];
  } = {
    dragStart: [],
    propsChange: [],
    drag: [],
    drop: [],
    over: [],
    out: []
  };

  history: ReturnType<typeof dragPayloadFactory>[] = [];
  container?: HTMLElement;
  props: any = undefined;
  hovered: HTMLElement[] = [];

  dragStart = async (e: DragEvent) => {
    this.history = [dragPayloadFactory(e)];
    this.notify("dragStart");
  };

  drag = async (e: DragEvent) => {
    this.history.push(dragPayloadFactory(e));
    this.notify("drag");
  };

  drop = async (e: DragEvent) => {
    this.notify("drop");
    await this.cancel();
  };

  cancel = async () => {
    this.history = [];
    this.dragProps = undefined;
  };

  set dragProps(value) {
    this.props = value;
    (async () => {
      await this.notify("propsChange");
    })();
  }

  get dragProps() {
    return this.props;
  }

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

  on = (e: DragMonitorEvents, fn: Listener) => {
    this.off(e, fn);
    if (this.subs[e] == null) this.subs[e] = [];
    this.subs[e].push(fn);
  };

  off = (e: DragMonitorEvents, fn: Listener) => {
    remove(this.subs[e], fn);
  };

  notify = async (e: DragMonitorEvents, ...args: any) => {
    if (this.subs[e] != null) {
      return Promise.all(
        this.subs[e].map(async fn => {
          fn(this, ...args);
        })
      );
    }

    return undefined;
  };

  getBounds = (rect: ClientRect | DOMRect) => {
    if (this.container == null || rect == null) {
      return {
        maxX: +Infinity,
        maxY: +Infinity,
        minX: -Infinity,
        minY: -Infinity
      };
    }

    const cr = this.container.getBoundingClientRect();

    return {
      maxX: cr.right - rect.right,
      maxY: cr.bottom - rect.bottom,
      minX: cr.left - rect.left,
      minY: cr.top - rect.top
    };
  };

  getDeltas = (rect: ClientRect | DOMRect) => {
    const bounds = this.getBounds(rect);

    return {
      deltaX: Math.max(Math.min(this.deltaX, bounds.maxX), bounds.minX),
      deltaY: Math.max(Math.min(this.deltaY, bounds.maxY), bounds.minY)
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
