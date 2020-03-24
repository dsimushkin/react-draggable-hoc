import useDragPhaseListener from "./useDragPhaseListener";
import { DragPhase } from "./HtmlHelpers";

function useDragStopPropagation(
  ref: React.RefObject<any>,
  ...phases: DragPhase[]
) {
  if (ref == null) {
    console.warn("Do not use useDragStopPropagation without a ref");
  }
  useDragPhaseListener(e => e.stopPropagation(), phases, ref);
}

export default useDragStopPropagation;
