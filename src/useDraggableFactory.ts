import * as React from "react";

import { DragContext } from "./dragDropContainer";
import useForceUpdate from "./useForceUpdate";
import {
  DragListener,
  isDragStart,
  isDragEvent,
  attach,
  detach
} from "./helpers";

export function useDraggableFactory(context: typeof DragContext) {
  return function useDraggable(
    ref: React.RefObject<any>,
    { dragProps, delay = 0 }: { dragProps?: any; delay?: number } = {}
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
          monitor.dragProps = dragProps;
          monitor.start(e);
          if (!isDragged) change(true);
        }
      };
      const cancelListener = () => {
        clearTimeout(t);
        if (delayed != null) changeDelayed(undefined);
      };

      let t: number;
      let dragListener: DragListener | undefined = undefined;
      let dropListener: DragListener | undefined = undefined;
      let dragStartListener: DragListener | undefined = undefined;

      if (delayed != null) {
        t = window.setTimeout(() => {
          changeDelayed(undefined);
          syncListener(delayed);
        }, delay);
        dropListener = dragListener = cancelListener;
      } else {
        if (node != null && !isDragged) {
          if (delay > 0) {
            dragStartListener = (e: MouseEvent | TouchEvent) => {
              changeDelayed(e);
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
            } else {
              e.preventDefault();
              forceUpdate();
              monitor.drag(e);
            }
          };

          dropListener = (e: Event) => {
            if (isDragged) change(false);
            monitor.drop();
          };
        }
      }

      if (dropListener != null) attach("drop", dropListener);
      if (dragListener != null) attach("drag", dragListener);
      if (dragStartListener != null) {
        attach("dragStart", dragStartListener, node);
      }

      return () => {
        clearTimeout(t);

        if (dropListener != null) detach("drop", dropListener);
        if (dragListener != null) detach("drag", dragListener);
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
      container
    };

    return r;
  };
}
