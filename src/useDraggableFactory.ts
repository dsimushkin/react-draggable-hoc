import * as React from "react";

import { ISharedState } from "./IDndObserver";

import useForceUpdate from "./useForceUpdate";
import DragContext from "./IDragContext";

function useDraggableFactory<T, E>(context: React.Context<DragContext<T, E>>) {
  type DragListener = (state: ISharedState<T, E>) => void;

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
      onDragCancel?: Function;
    } = {},
  ) {
    const { observer, container } = React.useContext(context);
    const [isDragged, change] = React.useState(false);
    const [isDelayed, changeDelayed] = React.useState(false);
    const [forceUpdate] = useForceUpdate();

    React.useEffect(() => {
      const node = ref && ref.current;

      const delayedListener: DragListener = state => {
        if (!isDelayed) {
          changeDelayed(true);
          if (typeof onDelayedDrag === "function") {
            onDelayedDrag(state);
          }
        }
      };

      const cancelListener: DragListener | undefined =
        isDragged || isDelayed
          ? state => {
              if (isDelayed) changeDelayed(false);
              if (isDragged) change(false);
              if (typeof onDragCancel === "function") {
                onDragCancel(state);
              }
            }
          : undefined;

      const dragStartListener: DragListener = state => {
        if (!isDragged) change(true);
        if (typeof onDragStart === "function") {
          onDragStart(state);
        }
      };

      const dragListener: DragListener | undefined = isDragged
        ? state => {
            console.log("drag");
            forceUpdate();
            if (typeof onDrag === "function") {
              onDrag(state);
            }
          }
        : undefined;

      const dropListener: DragListener | undefined = isDragged
        ? state => {
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
            onDragCancel: cancelListener,
          })
        : undefined;

      return () => {
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
