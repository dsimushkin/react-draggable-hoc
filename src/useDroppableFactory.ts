import * as React from "react";

import DragContext from "./IDragContext";
import useDndObserverListenerFactory from "./useDndObserverListenerFactory";
import { IDndObserver } from "./IDndObserver";

function useDroppableFactory<T, D extends IDndObserver<any, any, any>>(
  context: React.Context<DragContext<T, D>>,
) {
  const useDndObserverListener = useDndObserverListenerFactory(context);

  return function useDroppable(
    ref: React.RefObject<any>,
    {
      method,
      onDrop,
      disabled = false,
    }: {
      method?: (state: D["state"], ref: React.RefObject<any>) => Boolean;
      onDrop?: (dragProps: any) => void;
      disabled?: boolean;
    },
  ) {
    const { observer } = React.useContext(context);
    const factory = React.useCallback(
      (state: D["state"]) => ({
        isHovered:
          state.dragProps != null && !disabled && typeof method === "function"
            ? method(state as any, ref)
            : false,
        dragProps: state.dragProps,
      }),
      [method, observer, disabled],
    );
    const [props, change] = React.useState(factory(observer.state));
    const dragListener = React.useCallback(
      (state: D["state"]) => {
        const nprops = factory(state);
        if (Object.keys(nprops).some(key => nprops[key] !== props[key])) {
          change(nprops);
        }
      },
      [props, change, factory],
    );
    useDndObserverListener(dragListener, "dragStart", "drag", "cancel");

    const dropListener = React.useCallback(
      (state: D["state"]) => {
        const nprops = {
          dragProps: undefined,
          isHovered: false,
        };

        if (Object.keys(nprops).some(key => nprops[key] !== props[key])) {
          change(nprops);
        }

        if (props.isHovered && typeof onDrop === "function") {
          onDrop(props.dragProps);
        }
      },
      [factory, observer, props, onDrop],
    );
    useDndObserverListener(dropListener, "drop");

    return props;
  };
}

export default useDroppableFactory;
