import * as React from "react";

import DragContext from "./IDragContext";
import { DnDPhases, IDndObserver } from "./IDndObserver";

function useDndObserverListenerFactory<T, D extends IDndObserver<T, any, any>>(
  context: React.Context<DragContext<T, D>>,
) {
  return function useDndObserverListener(
    listener: (state: D["state"]) => void,
    ...phases: DnDPhases[]
  ) {
    const { observer } = React.useContext(context);
    if (observer == null) {
      console.error("Dnd context not found");
    }
    React.useEffect(() => {
      if (typeof listener !== "function" || observer == null) return;

      phases.forEach(phase => {
        observer.on(phase, listener);
      });

      return () => {
        phases.forEach(phase => {
          observer.off(phase, listener);
        });
      };
    });
  };
}

export default useDndObserverListenerFactory;
