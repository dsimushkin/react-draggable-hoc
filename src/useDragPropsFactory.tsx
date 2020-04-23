import * as React from "react";

import DragContext from "./IDragContext";
import useDndObserverListenerFactory from "./useDndObserverListenerFactory";
import { IDndObserver } from "./IDndObserver";

function useDragPropsFactory<T, D extends IDndObserver<any, any, any, any>>(
  context: React.Context<DragContext<T, D>>,
) {
  const useDndObserverListener = useDndObserverListenerFactory(context);

  return function useDragProps({
    disabled = false,
  }: { disabled?: boolean } = {}) {
    const [dragProps, changeDragProps] = React.useState<T>();
    const listener = React.useCallback(
      (state: D["state"]) => {
        if (!disabled && dragProps !== state.dragProps) {
          changeDragProps(state.dragProps);
        }
      },
      [dragProps, changeDragProps, disabled],
    );
    useDndObserverListener(listener, "dragStart", "dragPropsChange");

    const cleanup = React.useCallback(() => {
      if (!disabled && dragProps != null) {
        changeDragProps(undefined);
      }
    }, [dragProps, changeDragProps, disabled]);
    useDndObserverListener(cleanup, "drop", "cancel");

    return disabled ? undefined : dragProps;
  };
}

export default useDragPropsFactory;
