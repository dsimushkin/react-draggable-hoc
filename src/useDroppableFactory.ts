import * as React from "react";

import DragContext from "./IDragContext";
import useDndObserverListenerFactory from "./useDndObserverListenerFactory";
import { IDndObserver } from "./IDndObserver";
import throttle from "./throttle";

function useDroppableFactory<T, D extends IDndObserver<any, any, any, any>>(
  context: React.Context<DragContext<T, D>>,
) {
  const useDndObserverListener = useDndObserverListenerFactory(context);

  return function useDroppable(
    ref: React.RefObject<any>,
    {
      method,
      onDrop,
      disabled = false,
      throttleMs = 10,
    }: {
      method?: (
        state: D["state"],
        ref: React.RefObject<any>,
        defaultMethod: (
          state: D["state"],
          ref: React.RefObject<any>,
        ) => Boolean,
      ) => Boolean;
      onDrop?: (state: D["state"]) => void;
      disabled?: boolean;
      throttleMs?: number;
    } = {},
  ) {
    const { observer, defaultDroppableMethod } = React.useContext(context);

    const methodWrapper = React.useCallback(
      (state: D["state"], ref: React.RefObject<any>) => {
        return typeof method === "function"
          ? method(state, ref, defaultDroppableMethod)
          : defaultDroppableMethod(state, ref);
      },
      [method],
    );

    const isHoveredInState = React.useCallback(
      (state: D["state"]) =>
        state.dragProps != null && !disabled
          ? methodWrapper(state as any, ref)
          : false,
      [method, observer, disabled],
    );

    const [isHovered, change] = React.useState(
      isHoveredInState(observer.state),
    );

    const defaultDragListener = React.useCallback(
      (state: D["state"]) => {
        if (isHovered !== isHoveredInState(state)) {
          change(!isHovered);
        }
      },
      [isHovered, isHoveredInState, change],
    );

    useDndObserverListener(
      !disabled ? defaultDragListener : undefined,
      "dragStart",
      "dragPropsChange",
    );

    const dragListener = React.useMemo(() => {
      if (disabled) return undefined;

      return throttle(defaultDragListener, throttleMs);
    }, [disabled, defaultDragListener, throttleMs]);
    useDndObserverListener(dragListener, "drag", "cancel");

    const dropListener = React.useMemo(() => {
      if (disabled) return undefined;

      return (state: D["state"]) => {
        if (isHovered) change(false);

        if (isHovered && typeof onDrop === "function") {
          onDrop(state);
        }
      };
    }, [disabled, isHovered, change, onDrop]);
    useDndObserverListener(dropListener, "drop");

    React.useEffect(() => {
      return observer.makeDroppable(ref != null ? ref.current : undefined);
    });

    return { isHovered };
  };
}

export default useDroppableFactory;
