import * as React from "react";

import { DragPhase } from "./helpers";
import { DragContext } from "./dragDropContainer";
import useMonitorListenerFactory from "./useMonitorListenerFactory";
import useDraggableFactory from "./useDraggableFactory";
import useDragPhaseListener from "./useDragPhaseListener";

export function useDragStopPropagation(
  ref: React.RefObject<any>,
  ...phases: DragPhase[]
) {
  if (ref == null) {
    console.warn("Do not use useDragStopPropagation without a ref");
  }
  useDragPhaseListener(e => e.stopPropagation(), phases, ref);
}

export const useDraggable = useDraggableFactory(DragContext);
export const useMonitorListener = useMonitorListenerFactory(DragContext);
