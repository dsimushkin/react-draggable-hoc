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
} from "./HtmlHelpers";
import { getBounds, fixToRange } from "./helpers";

function dragPayloadFactory(event: MouseEvent | TouchEvent) {
  const { pageX, pageY, target } = isTouchEvent(event)
    ? getPointer(event as TouchEvent)
    : (event as MouseEvent);
  return {
    x: pageX,
    y: pageY,
    target,
    event,
  };
}

export type HtmlDragPayload = ReturnType<typeof dragPayloadFactory>;

function HtmlDndObserver<T>(): IDndObserver<T, HtmlDragPayload> {
  const subs = new PubSub<DnDPhases, (state: typeof sharedState) => void>();

  let dragListener: DndEventListener | undefined = undefined;
  let dropListener: DndEventListener | undefined = undefined;

  let dragged: HTMLElement | undefined = undefined;
  let dragProps: T | undefined = undefined;
  let history: HtmlDragPayload[] = [];
  let initialized = false;
  let t: number | undefined = undefined;
  let st: number | undefined = undefined;

  const cleanup = () => {
    if (t != null) {
      clearTimeout(t);
      t = undefined;
    }
    if (st != null) {
      clearInterval(st);
      st = undefined;
    }
    dragged = undefined;
    dragProps = undefined;
    dragListener = undefined;
    dropListener = undefined;
  };

  const cancelListener = async () => {
    let notificationNeeded = t != null || dragged != null;
    cleanup();
    if (notificationNeeded) {
      await subs.notify("cancel", sharedState);
    }
  };

  const sharedState = new (class implements ISharedState<T, HtmlDragPayload> {
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

    get deltaX() {
      return history.length < 2 ? 0 : this.current!.x - this.initial!.x;
    }

    get deltaY() {
      return history.length < 2 ? 0 : this.current!.y - this.initial!.y;
    }

    get node() {
      return dragged;
    }

    getDeltas = (container: HTMLElement, rect: ClientRect | DOMRect) => {
      const bounds = getBounds(container, rect);

      return {
        deltaX: fixToRange(this.deltaX, bounds.minX, bounds.maxX),
        deltaY: fixToRange(this.deltaY, bounds.minY, bounds.maxY),
      };
    };
  })();

  const onDragListener = async (e: DndEvent) => {
    clearInterval(st);
    st = undefined;

    if (t != null) {
      cancelListener();
      return;
    }

    if (dragged != null) {
      e.preventDefault();
      if (!isDragEvent(e) || getSelection()) {
        cancelListener();
      } else if (typeof dragListener === "function") {
        dragListener(e);
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

  const monitorSelection = () => {
    clearInterval(st);
    st = window.setInterval(() => {
      if (getSelection()) {
        cancelListener();
      }
    }, 10);
  };

  const makeDraggable = (
    node: HTMLElement,
    config: Parameters<
      IDndObserver<T, HtmlDragPayload>["makeDraggable"]
    >[1] = {},
  ) => {
    init();
    node.style.userSelect = "none";

    const defaultDragListener = async (e: DndEvent) => {
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
      if (
        isDragStart(e) &&
        node?.contains(e.target as HTMLElement) &&
        !getSelection()
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
      if (!getSelection()) {
        t = window.setTimeout(() => {
          t = undefined;
          if (getSelection()) {
            cancelListener();
          } else {
            defaultDragStartListener(e);
          }
        }, config.delay);
        if (typeof config.onDelayedDrag === "function") {
          config.onDelayedDrag(sharedState);
        }
        await subs.notify("delayedDrag", sharedState);
      }
    };

    if (node === dragged) {
      dragListener = defaultDragListener;
      dropListener = defaultDropListener;
    }

    const listener = config.delay
      ? delayedDragListener
      : defaultDragStartListener;
    attach("dragStart", listener, node);

    return () => {
      detach("dragStart", listener, node);
      dragListener = undefined;
      dropListener = undefined;
    };
  };

  const init = () => {
    if (!initialized) {
      attach("drag", onDragListener);
      attach("drop", onDropListener);
      window.addEventListener("scroll", cancelListener, true);
      window.addEventListener("contextmenu", cancelListener, true);
      window.addEventListener("touchcancel", cancelListener, true);
      initialized = true;
    }
  };

  const destroy = () => {
    cleanup();
    if (initialized) {
      detach("drag", onDragListener);
      detach("drop", onDropListener);
      window.removeEventListener("scroll", cancelListener, true);
      window.removeEventListener("contextmenu", cancelListener, true);
      window.removeEventListener("touchcancel", cancelListener, true);
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
  };
}

export default HtmlDndObserver;
