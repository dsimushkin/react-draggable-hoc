import * as React from "react";

import useForceUpdate from "./useForceUpdate";
import DragContext from "./IDragContext";
import { IDndObserver } from "./IDndObserver";

function useDraggableFactory<T, D extends IDndObserver<T, any, any>>(
  context: React.Context<DragContext<T, D>>,
) {
  return function useDraggable(
    ref: React.RefObject<any>,
    {
      dragProps,
      delay = 0,
      onDelayedDrag,
      onDragStart,
      onDrag,
      onDrop,
      onDragCancel,
      disabled = false,
    }: {
      dragProps: T;
      delay?: number;
      onDragStart?: (state: D["state"]) => void;
      onDrag?: (state: D["state"]) => void;
      onDrop?: (state: D["state"]) => void;
      onDelayedDrag?: (state: D["state"]) => void;
      onDragCancel?: Function;
      disabled?: Boolean;
    },
  ) {
    const { observer, container } = React.useContext(context);
    const [isDragged, change] = React.useState(false);
    const [isDelayed, changeDelayed] = React.useState(false);
    const [forceUpdate] = useForceUpdate();

    React.useEffect(() => {
      if (disabled === true || observer == null) return;

      const node = ref && ref.current;

      const delayedListener = (state: D["state"]) => {
        if (!isDelayed) {
          changeDelayed(true);
          if (typeof onDelayedDrag === "function") {
            onDelayedDrag(state);
          }
        }
      };

      const cancelListener =
        isDragged || isDelayed
          ? (state: D["state"]) => {
              if (isDelayed) changeDelayed(false);
              if (isDragged) change(false);
              if (typeof onDragCancel === "function") {
                onDragCancel(state);
              }
            }
          : undefined;

      const dragStartListener = (state: D["state"]) => {
        if (!isDragged) change(true);
        if (typeof onDragStart === "function") {
          onDragStart(state);
        }
      };

      const dragListener = isDragged
        ? (state: D["state"]) => {
            forceUpdate();
            if (typeof onDrag === "function") {
              onDrag(state);
            }
          }
        : undefined;

      const dropListener = isDragged
        ? (state: D["state"]) => {
            change(false);
            if (typeof onDrop === "function") {
              onDrop(state);
            }
          }
        : undefined;

      const destroy = node
        ? observer.makeDraggable(node, {
            delay,
            dragProps,
            onDragStart: dragStartListener,
            onDelayedDrag: delayedListener,
            onDrop: dropListener,
            onDrag: dragListener,
          })
        : undefined;

      if (cancelListener) {
        observer.on("cancel", cancelListener);
      }

      return () => {
        if (cancelListener) {
          observer.off("cancel", cancelListener);
        }
        if (typeof destroy === "function") {
          destroy();
        }
      };
    });

    const { state } = observer;

    const r = {
      deltaX: isDragged ? state.deltaX : 0,
      deltaY: isDragged ? state.deltaY : 0,
      isDragged,
      isDelayed,
      state,
      container,
    };

    return r;
  };
}

export default useDraggableFactory;
