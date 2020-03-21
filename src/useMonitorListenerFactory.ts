import * as React from "react";

import { DragContext } from "./dragDropContainer";
import { Listener, DragMonitorPhase } from "./DragMonitor";

function useMonitorListenerFactory(context: typeof DragContext) {
  return function useMonitorListener(
    listener: Listener,
    ...phases: DragMonitorPhase[]
  ) {
    const { monitor } = React.useContext(context);
    React.useEffect(() => {
      if (typeof listener !== "function") return;

      phases.forEach(phase => {
        monitor.on(phase, listener);
      });

      return () => {
        phases.forEach(phase => {
          monitor.off(phase, listener);
        });
      };
    });
  };
}

export default useMonitorListenerFactory;
