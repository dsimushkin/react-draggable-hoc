import * as React from "react";
import { DragMonitor } from "./DragMonitor";

interface IDragContext {
  monitor: DragMonitor;
  container?: React.RefObject<any>;
}

export default IDragContext;
