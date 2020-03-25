import { DndObserver } from "./IDndObserver";
import {
  isTouchEvent,
  getPointer,
  DndEventListener,
  DndEvent,
  isDragEvent,
  isDragStart,
  attach,
  detach,
  getSelection,
  clearSelection,
  DragPhase,
} from "./HtmlHelpers";

import { sleep } from "./utils";

function dragPayloadFactory(event: MouseEvent | TouchEvent) {
  const { pageX, pageY } = isTouchEvent(event)
    ? getPointer(event as TouchEvent)
    : (event as MouseEvent);
  return {
    x: pageX,
    y: pageY,
    event,
  };
}

class HtmlDndObserver<T> extends DndObserver<T, DndEvent, HTMLElement> {
  private dragListener: DndEventListener | undefined = undefined;
  private dropListener: DndEventListener | undefined = undefined;
  private initialized = false;
  private t: number | undefined = undefined;
  private st: number | undefined = undefined;
  private selection: string = "";

  cleanup() {
    super.cleanup();
    if (this.t != null) {
      clearTimeout(this.t);
      this.t = undefined;
    }
    this.selection = "";
    this.clearSelectionMonitor();
    this.dragListener = undefined;
    this.dropListener = undefined;
  }

  async cancel() {
    let notificationNeeded = this.t != null || this.dragged != null;
    this.cleanup();
    if (notificationNeeded) {
      await this.subs.notify("cancel", this.state);
    }
  }

  private clearSelectionMonitor = () => {
    if (this.st != null) {
      clearInterval(this.st);
      this.st = undefined;
    }
  };

  private checkSelection = () => {
    return this.selection !== getSelection();
  };

  private monitorSelection = () => {
    this.clearSelectionMonitor();
    this.selection = getSelection();
    this.st = window.setInterval(() => {
      if (this.checkSelection()) {
        this.clearSelectionMonitor();
        this.cancel();
      }
    }, 10);
  };

  private onDragListener = async (e: DndEvent) => {
    this.clearSelectionMonitor();

    if (this.t != null) {
      this.cancel();
      return;
    }

    if (this.dragged != null) {
      e.preventDefault();
      if (!isDragEvent(e) || this.checkSelection()) {
        this.cancel();
      } else {
        this.wasDetached = true;
        if (typeof this.dragListener === "function") {
          this.dragListener(e);
        }
      }
    }
  };

  private onDropListener = async (e: DndEvent) => {
    if (this.t != null) {
      this.cancel();
      return;
    }

    if (this.dragged != null && typeof this.dropListener === "function") {
      this.dropListener(e);
    }
  };

  makeDraggable: DndObserver<T, DndEvent, HTMLElement>["makeDraggable"] = (
    node,
    config = {},
  ) => {
    this.init();
    node.style.userSelect = "none";

    const defaultDragListener = async (e: DndEvent) => {
      await sleep(0);
      this.history.push(dragPayloadFactory(e));
      if (typeof config.onDrag === "function") {
        config.onDrag(this.state);
      }
      await this.subs.notify("drag", this.state);
    };

    const defaultDropListener = async (e: DndEvent) => {
      await sleep(0);
      this.history.push(dragPayloadFactory(e));
      if (typeof config.onDrop === "function") {
        config.onDrop(this.state);
      }
      await this.subs.notify("drop", this.state);
      this.cleanup();
    };

    const defaultDragStartListener = async (e: DndEvent) => {
      await sleep(0);
      if (!config.delay) {
        clearSelection();
        this.selection = getSelection();
      }

      if (
        isDragStart(e) &&
        node?.contains(e.target as HTMLElement) &&
        !this.checkSelection()
      ) {
        this.cleanup();
        this.dragListener = defaultDragListener;
        this.dropListener = defaultDropListener;

        this.history = [dragPayloadFactory(e)];
        this.dragProps = config.dragProps;
        this.dragged = node;

        if (typeof config.onDragStart === "function") {
          config.onDragStart(this.state);
        }
        await this.subs.notify("dragStart", this.state);
        this.monitorSelection();
      }
    };

    const delayedDragListener = async (e: DndEvent) => {
      await sleep(0);
      clearSelection();
      this.selection = getSelection();
      this.t = window.setTimeout(() => {
        this.t = undefined;
        if (this.checkSelection()) {
          this.cancel();
        } else {
          defaultDragStartListener(e);
        }
      }, config.delay);
      if (typeof config.onDelayedDrag === "function") {
        config.onDelayedDrag(this.state);
      }
      await this.subs.notify("delayedDrag", this.state);
    };

    if (node === this.dragged) {
      this.dragListener = defaultDragListener;
      this.dropListener = defaultDropListener;
    }

    const listener = config.delay
      ? delayedDragListener
      : defaultDragStartListener;
    attach("dragStart", listener, node, { passive: true, capture: false });

    return () => {
      detach("dragStart", listener, node, { capture: false });
      if (node === this.dragged) {
        this.dragListener = undefined;
        this.dropListener = undefined;
      }
    };
  };

  init = () => {
    if (!this.initialized) {
      attach("drag", this.onDragListener, window, { passive: false });
      attach("drop", this.onDropListener, window, { passive: false });
      window.addEventListener("scroll", this.cancel, { passive: true });
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
      window.removeEventListener("scroll", this.cancel);
      window.removeEventListener("contextmenu", this.cancel);
      window.removeEventListener("touchcancel", this.cancel);
      this.initialized = false;
    }
  };

  stopPropagation = (node: HTMLElement, ...phases: DragPhase[]) => {
    // if (node == null) throw new Error("Invalid target");
    const listener = (e: DndEvent) => {
      e.stopPropagation();
    };
    phases.forEach(phase => {
      attach(phase, listener, node, { passive: false, capture: false });
    });

    return () => {
      phases.forEach(phase => {
        detach(phase, listener, node, { capture: false });
      });
    };
  };
}

export default HtmlDndObserver;
