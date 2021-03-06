import * as React from "react";

import useForceUpdate from "./useForceUpdate";
import DragContext from "./IDragContext";
import { IDndObserver } from "./IDndObserver";
import throttle from "./throttle";

function useDraggableFactory<T, D extends IDndObserver<T, any, any, any>>(
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
      throttleMs = 10,
    }: {
      dragProps: T;
      delay?: number;
      onDragStart?: (state: D["state"]) => void;
      onDrag?: (state: D["state"]) => void;
      onDrop?: (state: D["state"]) => void;
      onDelayedDrag?: (state: D["state"]) => void;
      onDragCancel?: (state: D["state"]) => void;
      disabled?: Boolean;
      throttleMs?: number;
    },
  ) {
    const { observer, container } = React.useContext(context);
    const [isDragged, change] = React.useState(
      observer.dragProps != null && observer.dragProps === dragProps,
    );
    const [isDelayed, changeDelayed] = React.useState(false);
    const [forceUpdate] = useForceUpdate();

    const dragListener = React.useMemo(() => {
      return isDragged
        ? throttle(async (state: D["state"]) => {
            forceUpdate();
            if (typeof onDrag === "function") {
              onDrag(state);
            }
          }, throttleMs)
        : undefined;
    }, [isDragged, onDrag, forceUpdate, throttleMs]);

    const dropListener = React.useMemo(() => {
      return isDragged
        ? (state: D["state"]) => {
            change(false);
            if (typeof onDrop === "function") {
              onDrop(state);
            }
          }
        : undefined;
    }, [isDragged, change, onDrop]);

    const delayedListener = React.useCallback(
      (state: D["state"]) => {
        if (!isDelayed) {
          changeDelayed(true);
          if (typeof onDelayedDrag === "function") {
            onDelayedDrag(state);
          }
        }
      },
      [isDelayed, changeDelayed, onDelayedDrag],
    );

    const cancelListener = React.useCallback(() => {
      if (isDelayed) changeDelayed(false);
      if (isDragged) change(false);
      if (typeof onDragCancel === "function") {
        onDragCancel(observer.state);
      }
    }, [isDragged, isDelayed, changeDelayed, change, onDragCancel]);

    const dragStartListener = React.useCallback(
      (state: D["state"]) => {
        if (!isDragged) change(true);
        if (isDelayed) changeDelayed(false);
        if (typeof onDragStart === "function") {
          onDragStart(state);
        }
      },
      [isDragged, change, isDelayed, changeDelayed, onDragStart],
    );

    const dragPropsChangeListener = React.useCallback(
      (state: D["state"]) => {
        if (dragProps != null) {
          if (isDragged !== (state.dragProps === dragProps)) {
            change(!isDragged);
          }
        }
      },
      [dragProps, isDragged, change],
    );

    React.useEffect(() => {
      if (disabled === true || observer == null) return;

      const node = ref && ref.current;

      return node
        ? observer.makeDraggable(node, {
            delay,
            dragProps,
            onDragStart: dragStartListener,
            onDelayedDrag: delayedListener,
            onDrop: dropListener,
            onDrag: dragListener,
            onDragCancel: cancelListener,
            onDragPropsChange: dragPropsChangeListener,
          })
        : undefined;
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
