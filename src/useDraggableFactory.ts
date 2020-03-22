import * as React from "react";

import { DragContext } from "./dragDropContainer";
import useForceUpdate from "./useForceUpdate";
import {
  DragListener,
  isDragStart,
  isDragEvent,
  attach,
  detach,
} from "./helpers";

function useDraggableFactory(context: typeof DragContext) {
  return function useDraggable(
    ref: React.RefObject<any>,
    {
      dragProps,
      delay = 0,
      onDragStart,
      onDrag,
      onDrop,
      onDelayedDrag,
      onDragCancel,
    }: {
      dragProps?: any;
      delay?: number;
      onDragStart?: DragListener;
      onDrag?: DragListener;
      onDrop?: DragListener;
      onDelayedDrag?: DragListener;
      onDragCancel?: DragListener;
    } = {},
  ) {
    const { monitor, container } = React.useContext(context);
    const [isDragged, change] = React.useState(false);
    const [delayed, changeDelayed] = React.useState<MouseEvent | TouchEvent>();
    const [forceUpdate] = useForceUpdate();

    React.useEffect(() => {
      const node = ref && ref.current;

      if (node) node.style.userSelect = "none";

      const syncListener: DragListener = e => {
        if (isDragStart(e) && node?.contains(e.target as Node)) {
          if (!isDragged) change(true);
          monitor.dragProps = dragProps;
          monitor.start(e);
          if (typeof onDragStart === "function") onDragStart(e);
        }
      };
      const cancelListener = (e: MouseEvent | TouchEvent) => {
        clearTimeout(t);
        if (delayed != null) changeDelayed(undefined);
        if (typeof onDragCancel === "function") {
          onDragCancel(e);
        }
      };

      let t: number;
      let dragListener: DragListener | undefined = undefined;
      let dropListener: DragListener | undefined = undefined;
      let dragStartListener: DragListener | undefined = undefined;

      if (delayed != null) {
        t = window.setTimeout(() => {
          syncListener(delayed);
          changeDelayed(undefined);
        }, delay);
        dropListener = dragListener = cancelListener;
      } else {
        if (node != null && !isDragged) {
          if (delay > 0) {
            dragStartListener = (e: MouseEvent | TouchEvent) => {
              changeDelayed(e);
              if (typeof onDelayedDrag === "function") {
                onDelayedDrag(e);
              }
            };
          } else {
            dragStartListener = syncListener;
          }
        }

        if (isDragged) {
          dragListener = (e: MouseEvent | TouchEvent) => {
            if (!isDragEvent(e) || window.getSelection()?.toString()) {
              if (isDragged) change(false);
              monitor.cancel();
              if (typeof onDragCancel === "function") {
                onDragCancel(e);
              }
            } else {
              e.preventDefault();
              forceUpdate();
              monitor.drag(e);
              if (typeof onDrag === "function") {
                onDrag(e);
              }
            }
          };

          dropListener = (e: MouseEvent | TouchEvent) => {
            if (isDragged) change(false);
            monitor.drop();
            if (typeof onDrop === "function") {
              onDrop(e);
            }
          };
        }
      }

      if (dropListener != null) {
        attach("drop", dropListener);
      }
      if (dragListener != null) {
        attach("drag", dragListener);
      }
      if (dragStartListener != null) {
        attach("dragStart", dragStartListener, node);
      }

      return () => {
        clearTimeout(t);

        if (dropListener != null) {
          detach("drop", dropListener);
        }
        if (dragListener != null) {
          detach("drag", dragListener);
        }
        if (dragStartListener != null) {
          detach("dragStart", dragStartListener, node);
        }
      };
    });

    const r = {
      deltaX: isDragged ? monitor.deltaX : 0,
      deltaY: isDragged ? monitor.deltaY : 0,
      isDragged,
      delayed,
      monitor,
      container,
    };

    return r;
  };
}

export default useDraggableFactory;
