import { IDndObserver, ISharedState, DnDPhases } from "./IDndObserver";
import {
  isTouchEvent,
  getPointer,
  AsyncDndEventListener,
  DndEvent,
  isDragEvent,
  isDragStart,
  attach,
  detach,
  getSelection,
  clearSelection,
  isMouseEvent,
} from "./HtmlHelpers";
import PubSub from "./PubSub";
import { remove } from "./utils";

export function dragPayloadFactory(event: MouseEvent | TouchEvent) {
  const { clientX, clientY } = isTouchEvent(event)
    ? getPointer(event as TouchEvent)
    : (event as MouseEvent);
  return {
    x: clientX,
    y: clientY,
    event,
  };
}

export interface HtmlDndObserverState<T>
  extends ISharedState<T, DndEvent, HTMLElement> {
  readonly elementsFromPoint: Element[];
}

class HtmlDndObserver<T>
  implements IDndObserver<T, DndEvent, HTMLElement, HtmlDndObserverState<T>> {
  constructor({ historyLength = 2 } = {}) {
    this.historyLength = historyLength;
  }
  private historyLength: number;
  private dragListener: AsyncDndEventListener | undefined = undefined;
  private dropListener: AsyncDndEventListener | undefined = undefined;
  private initialized = false;
  private t: number | undefined = undefined;
  private delayed: DndEvent | undefined = undefined;
  private st: number | undefined = undefined;
  private selection: string = "";
  private __dragProps?: T;

  // protected
  protected subs = new PubSub<
    DnDPhases,
    (state: HtmlDndObserverState<T>) => void
  >();

  // additionals
  public dragged?: HTMLElement = undefined;
  public wasDetached: Boolean = false;
  public history: HtmlDndObserverState<T>["history"] = [];
  public droppables: HTMLElement[] = [];

  public on = this.subs.on;
  public off = this.subs.off;

  get dragProps() {
    return this.__dragProps;
  }

  set dragProps(v) {
    if (this.dragged != null && this.__dragProps !== v) {
      this.__dragProps = v;
      this.subs.notifySync("dragPropsChange", this.state);
    }
  }

  cleanup = () => {
    this.dragged = undefined;
    this.__dragProps = undefined;
    this.wasDetached = false;
    if (this.t != null) {
      clearTimeout(this.t);
      this.t = undefined;
    }
    this.selection = "";
    this.clearSelectionMonitor();
    this.dragListener = undefined;
    this.dropListener = undefined;
    this.delayed = undefined;
  };

  cancel = async (...args: any[]) => {
    let notificationNeeded = this.t != null || this.dragged != null;
    this.cleanup();
    if (notificationNeeded) {
      await this.subs.notify("cancel", this.state);
    }
  };

  private clearSelectionMonitor = () => {
    if (this.st != null) {
      clearInterval(this.st);
      this.st = undefined;
    }
  };

  private checkSelection = () => {
    const selection = getSelection();
    const result = this.selection !== selection;
    this.selection = selection;
    return result;
  };

  private monitorSelection = () => {
    this.clearSelectionMonitor();
    this.selection = getSelection();
    this.st = window.setInterval(() => {
      if (this.checkSelection()) {
        this.clearSelectionMonitor();
        this.cancel("selection monitor");
      }
    }, 10);
  };

  private onDragListener = async (e: DndEvent) => {
    this.clearSelectionMonitor();

    if (this.delayed != null) {
      let shouldCancel = true;
      // add a simple threshold for touchpads/trackpads
      if (isMouseEvent(e)) {
        const p = dragPayloadFactory(e);
        const n = dragPayloadFactory(this.delayed);
        shouldCancel = Math.max(Math.abs(p.x - n.x), Math.abs(p.y - n.y)) > 2;
      }
      if (shouldCancel) this.cancel(e, "delayed drag timeout");
      return;
    }

    if (this.dragged != null) {
      if (!isDragEvent(e) || this.checkSelection()) {
        // cancel drag on second touch
        this.cancel(e);
      } else {
        // prevent scrolling on touch devices
        e.preventDefault();
        this.wasDetached = true;
        if (typeof this.dragListener === "function") {
          this.dragListener(e);
        }
      }
    }
  };

  private onDropListener = async (e: DndEvent) => {
    // ensure no async history updates comes
    this.dragListener = undefined;

    // check delayed
    if (this.t != null) {
      this.cancel(e);
      return;
    }

    if (this.dragged != null) {
      if (typeof this.dropListener === "function") {
        await this.dropListener(e);
      }
      this.cleanup();
    }
  };

  makeDraggable: IDndObserver<
    T,
    DndEvent,
    HTMLElement,
    HtmlDndObserverState<T>
  >["makeDraggable"] = (node, config) => {
    this.init();
    if (config == null || config.dragProps == null) {
      if (process.env.NODE_ENV === "development") {
        console.error("dragProps are required from v2.2.0");
      }
      return () => {};
    }
    // prevent from text selection on drag
    try {
      node.style.userSelect = "none";
      node.style.webkitUserSelect = "none";
      node.style.msUserSelect = "none";
      (node.style as any).MozUserSelect = "none";
    } catch (e) {}

    const defaultDragListener = async (e: DndEvent) => {
      this.history.splice(
        this.historyLength > 1 ? this.historyLength : 1,
        this.history.length,
        dragPayloadFactory(e),
      );
      if (typeof config.onDrag === "function") {
        config.onDrag(this.state);
      }
      await this.subs.notify("drag", this.state);
    };

    const defaultDropListener = async (e: DndEvent) => {
      this.history.splice(
        this.historyLength > 1 ? this.historyLength : 1,
        this.history.length,
        dragPayloadFactory(e),
      );
      if (typeof config.onDrop === "function") {
        config.onDrop(this.state);
      }

      this.subs.notifySync("drop", this.state);
    };

    const defaultDragStartListener = async (e: DndEvent) => {
      if (this.dragged == null) {
        this.delayed = undefined;

        if (!config.delay) {
          clearSelection();
          this.selection = getSelection();
        }

        if (isDragStart(e) && !this.checkSelection()) {
          if (isMouseEvent(e)) {
            // prevent Safari/ desktop from scrolling during mousemove
            // if touchstart is prevented, click won't be fired
            e.preventDefault();
          }
          this.cleanup();
          this.dragListener = defaultDragListener;
          this.dropListener = defaultDropListener;

          this.history = [dragPayloadFactory(e)];
          this.__dragProps = config.dragProps;
          this.dragged = node;

          if (typeof config.onDragStart === "function") {
            config.onDragStart(this.state);
          }

          this.subs.notifySync("dragStart", this.state);
          this.monitorSelection();
        }
      }
    };

    const delayedDragListener = async (e: DndEvent) => {
      if (this.delayed == null && this.dragged == null) {
        if (isDragStart(e)) {
          if (isMouseEvent(e)) {
            // prevent Safari/ desktop from scrolling during mousemove
            // if touchstart is prevented, click won't be fired
            e.preventDefault();
          }

          // deal with text selection
          clearSelection();
          this.selection = getSelection();

          this.delayed = e;

          this.t = window.setTimeout(() => {
            this.t = undefined;
            if (this.checkSelection()) {
              this.cancel(e);
            } else {
              defaultDragStartListener(e);
            }
          }, config.delay);

          if (typeof config.onDelayedDrag === "function") {
            config.onDelayedDrag(this.state);
          }

          await this.subs.notify("delayedDrag", this.state);
        }
      }
    };

    if (this.dragged != null && config.dragProps === this.dragProps) {
      this.dragged = node;
      this.dragListener = defaultDragListener;
      this.dropListener = defaultDropListener;
      if (typeof config.onDragCancel === "function") {
        this.subs.on("cancel", config.onDragCancel);
      }
    }

    const listener =
      config != null && config.delay != null && config.delay > 0
        ? delayedDragListener
        : defaultDragStartListener;

    attach("dragStart", listener, node, { passive: false, capture: false });
    if (typeof config.onDragPropsChange === "function") {
      this.subs.on("dragPropsChange", config.onDragPropsChange);
    }

    return () => {
      detach("dragStart", listener, node, { capture: false });
      if (this.dragListener === defaultDragListener) {
        this.dragListener = undefined;
      }
      if (this.dropListener === defaultDropListener) {
        this.dropListener = undefined;
      }
      if (typeof config.onDragPropsChange === "function") {
        this.subs.off("dragPropsChange", config.onDragPropsChange);
      }
      if (typeof config.onDragCancel === "function") {
        this.subs.off("cancel", config.onDragCancel);
      }
    };
  };

  makeDroppable = (node?: HTMLElement) => {
    if (node != null) {
      remove(this.droppables, node);
      this.droppables.push(node);
    }

    return () => {
      if (node != null) {
        remove(this.droppables, node);
      }
    };
  };

  init = () => {
    if (!this.initialized) {
      attach("drag", this.onDragListener, window, { passive: false });
      attach("drop", this.onDropListener, window, { passive: false });
      window.addEventListener("scroll", this.cancel as any, {
        passive: true,
        capture: true,
      });
      window.addEventListener("contextmenu", this.cancel, { passive: true });
      window.addEventListener("touchcancel", this.cancel, { passive: true });
      this.initialized = true;
    }
  };

  destroy = () => {
    this.cleanup();
    if (this.initialized) {
      detach("drag", this.onDragListener);
      detach("drop", this.onDropListener);
      window.removeEventListener("scroll", this.cancel as any, {
        capture: true,
      });
      window.removeEventListener("contextmenu", this.cancel);
      window.removeEventListener("touchcancel", this.cancel);
      this.initialized = false;
    }
  };

  // calculated
  public get state() {
    const self = this;
    let elementsFromPoint: Element[] | undefined = undefined;
    const { dragProps, dragged: node, wasDetached } = this;
    const history = this.history.slice();
    const initial = history.length ? history[0] : undefined;
    const current = history.length ? history[history.length - 1] : undefined;
    const deltaX = history.length < 2 ? 0 : current!.x - initial!.x;
    const deltaY = history.length < 2 ? 0 : current!.y - initial!.y;
    const droppables = this.droppables.slice();

    return {
      get history() {
        return history;
      },
      get initial() {
        return initial;
      },
      get current() {
        return current;
      },
      get deltaX() {
        return deltaX;
      },
      get deltaY() {
        return deltaY;
      },
      get node() {
        return node;
      },
      get wasDetached() {
        return wasDetached;
      },
      get droppables() {
        return droppables;
      },
      get dragProps() {
        return dragProps;
      },
      set dragProps(v) {
        self.dragProps = v;
      },
      get elementsFromPoint() {
        if (elementsFromPoint == null) {
          if (current != null) {
            const { x, y } = current;
            elementsFromPoint = [].slice.apply(
              document.elementsFromPoint(x, y),
            );
          } else {
            elementsFromPoint = [];
          }
        }

        return elementsFromPoint;
      },
      cancel: self.cancel,
    };
  }
}

export default HtmlDndObserver;
