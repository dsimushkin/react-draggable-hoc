import PubSub from "./PubSub";

import { DnDPhases, IDndObserver, ISharedState } from "./IDndObserver";
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

export type HtmlDragPayload = ReturnType<typeof dragPayloadFactory>;

export interface IHtmlDndObserver<T>
  extends IDndObserver<T, DndEvent, HTMLElement> {
  stopPropagation: (node: HTMLElement, ...phases: DragPhase[]) => () => void;
}

function HtmlDndObserver<T>(): IHtmlDndObserver<T> {
  const subs = new PubSub<DnDPhases, (state: typeof sharedState) => void>();

  let dragListener: DndEventListener | undefined = undefined;
  let dropListener: DndEventListener | undefined = undefined;

  let dragged: HTMLElement | undefined = undefined;
  let wasDetached = false;
  let dragProps: T | undefined = undefined;
  let history: HtmlDragPayload[] = [];
  let initialized = false;
  let t: number | undefined = undefined;

  let st: number | undefined = undefined;
  let selection: string = "";

  const clearSelectionMonitor = () => {
    if (st != null) {
      clearInterval(st);
      st = undefined;
    }
  };

  const checkSelection = () => {
    return selection !== getSelection();
  };

  const monitorSelection = () => {
    clearSelectionMonitor();
    selection = getSelection();
    st = window.setInterval(() => {
      if (checkSelection()) {
        clearSelectionMonitor();
        cancelListener();
      }
    }, 10);
  };

  const cleanup = () => {
    if (t != null) {
      clearTimeout(t);
      t = undefined;
    }
    selection = "";
    clearSelectionMonitor();
    dragged = undefined;
    dragProps = undefined;
    dragListener = undefined;
    dropListener = undefined;
    wasDetached = false;
  };

  const cancelListener = async () => {
    let notificationNeeded = t != null || dragged != null;
    cleanup();
    if (notificationNeeded) {
      await subs.notify("cancel", sharedState);
    }
  };

  const sharedState = new (class
    implements ISharedState<T, DndEvent, HTMLElement> {
    get dragProps() {
      return dragProps;
    }

    cancel = cancelListener;

    get initial() {
      return history.length ? history[0] : undefined;
    }

    get current() {
      return history.length ? history[history.length - 1] : undefined;
    }

    get history() {
      return history;
    }

    get deltaX() {
      return history.length < 2 ? 0 : this.current!.x - this.initial!.x;
    }

    get deltaY() {
      return history.length < 2 ? 0 : this.current!.y - this.initial!.y;
    }

    get node() {
      return dragged;
    }

    get wasDetached() {
      return wasDetached;
    }
  })();

  const onDragListener = async (e: DndEvent) => {
    clearSelectionMonitor();

    if (t != null) {
      cancelListener();
      return;
    }

    if (dragged != null) {
      e.preventDefault();
      if (!isDragEvent(e) || checkSelection()) {
        cancelListener();
      } else {
        wasDetached = true;
        if (typeof dragListener === "function") {
          dragListener(e);
        }
      }
    }
  };

  const onDropListener = async (e: DndEvent) => {
    if (t != null) {
      cancelListener();
      return;
    }

    if (dragged != null && typeof dropListener === "function") {
      dropListener(e);
    }
  };

  const makeDraggable = (
    node: HTMLElement,
    config: Parameters<IHtmlDndObserver<T>["makeDraggable"]>[1] = {},
  ) => {
    init();
    node.style.userSelect = "none";

    const defaultDragListener = async (e: DndEvent) => {
      await sleep(0);
      history.push(dragPayloadFactory(e));
      if (typeof config.onDrag === "function") {
        config.onDrag(sharedState);
      }
      subs.notify("drag", sharedState);
    };

    const defaultDropListener = async (e: DndEvent) => {
      if (typeof config.onDrop === "function") {
        config.onDrop(sharedState);
      }
      subs.notifySync("drop", sharedState);
      cleanup();
    };

    const defaultDragStartListener = async (e: DndEvent) => {
      await sleep(0);
      if (!config.delay) {
        clearSelection();
        selection = getSelection();
      }

      if (
        isDragStart(e) &&
        node?.contains(e.target as HTMLElement) &&
        !checkSelection()
      ) {
        cleanup();
        dragListener = defaultDragListener;
        dropListener = defaultDropListener;

        history = [dragPayloadFactory(e)];
        dragProps = config.dragProps;
        dragged = node;

        if (typeof config.onDragStart === "function") {
          config.onDragStart(sharedState);
        }
        await subs.notify("dragStart", sharedState);
        monitorSelection();
      }
    };

    const delayedDragListener = async (e: DndEvent) => {
      await sleep(0);
      clearSelection();
      selection = getSelection();
      t = window.setTimeout(() => {
        t = undefined;
        if (checkSelection()) {
          cancelListener();
        } else {
          defaultDragStartListener(e);
        }
      }, config.delay);
      if (typeof config.onDelayedDrag === "function") {
        config.onDelayedDrag(sharedState);
      }
      await subs.notify("delayedDrag", sharedState);
    };

    if (node === dragged) {
      dragListener = defaultDragListener;
      dropListener = defaultDropListener;
    }

    const listener = config.delay
      ? delayedDragListener
      : defaultDragStartListener;
    attach("dragStart", listener, node, { passive: true, capture: false });

    return () => {
      detach("dragStart", listener, node, { capture: false });
      if (node === dragged) {
        dragListener = undefined;
        dropListener = undefined;
      }
    };
  };

  const init = () => {
    if (!initialized) {
      attach("drag", onDragListener, window, { passive: false });
      attach("drop", onDropListener, window, { passive: false });
      window.addEventListener("scroll", cancelListener, { passive: true });
      window.addEventListener("contextmenu", cancelListener, { passive: true });
      window.addEventListener("touchcancel", cancelListener, { passive: true });
      initialized = true;
    }
  };

  const destroy = () => {
    cleanup();
    if (initialized) {
      detach("drag", onDragListener);
      detach("drop", onDropListener);
      window.removeEventListener("scroll", cancelListener);
      window.removeEventListener("contextmenu", cancelListener);
      window.removeEventListener("touchcancel", cancelListener);
      initialized = false;
    }
  };

  return {
    on: subs.on,
    off: subs.off,
    makeDraggable,
    init,
    destroy,
    state: sharedState,
    stopPropagation: (node: HTMLElement, ...phases: DragPhase[]) => {
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
    },
  };
}

export default HtmlDndObserver;
