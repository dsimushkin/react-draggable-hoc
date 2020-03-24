import * as React from "react";

import DragContext from "./IDragContext";
import { DnDPhases, ISharedState } from "./IDndObserver";

function useDndObserverListenerFactory<T, E>(
  context: React.Context<DragContext<T, E>>,
) {
  return function useDndObserverListener(
    listener: (state: ISharedState<T, E>) => void,
    ...phases: DnDPhases[]
  ) {
    const { observer } = React.useContext(context);
    React.useEffect(() => {
      if (typeof listener !== "function") return;

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
