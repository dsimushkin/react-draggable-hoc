import * as React from "react";

import { Listener, DragMonitorPhase } from "./DragMonitor";
import DragContext from "./IDragContext";

function useMonitorListenerFactory(context: React.Context<DragContext>) {
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
