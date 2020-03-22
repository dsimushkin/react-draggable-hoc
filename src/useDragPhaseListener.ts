import * as React from "react";
import { DragPhase, attach, detach } from "./helpers";

function useDragPhaseListener(
  listener: (e: Event) => any,
  phases: DragPhase[],
  ref?: React.RefObject<any>,
) {
  React.useEffect(() => {
    if (typeof listener !== "function" || (ref != null && ref.current == null))
      return;

    const node = ref != null ? ref.current : undefined;
    phases.forEach(phase => attach(phase, listener, node));

    return () => {
      phases.forEach(phase => detach(phase, listener, node));
    };
  });
}

export default useDragPhaseListener;
