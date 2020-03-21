import * as React from "react";

import { DragContext } from "./dragDropContainer";
import { DragMonitor } from "./DragMonitor";
import useMonitorListenerFactory from "./useMonitorListenerFactory";

export function defaultDroppableMethod(
  monitor: DragMonitor,
  ref: React.RefObject<any>
) {
  if (monitor.current && ref.current) {
    const { x, y } = monitor.current;
    return document.elementsFromPoint(x, y).indexOf(ref.current) >= 0;
  }

  return false;
}

function droppable(context: typeof DragContext) {
  const useMonitorListener = useMonitorListenerFactory(context);
  return function Droppable({
    children,
    method = defaultDroppableMethod,
    onDrop,
    disabled = false
  }: {
    children: React.FunctionComponent<any>;
    method?: typeof defaultDroppableMethod;
    onDrop?: (dragProps: any) => void;
    disabled?: boolean;
  }) {
    const { monitor } = React.useContext(context);
    const ref = React.useRef<any>();
    const factory = React.useCallback(
      monitor => ({
        isHovered:
          monitor.dragProps && !disabled ? method(monitor, ref) : false,
        dragProps: monitor.dragProps
      }),
      [method, monitor, disabled]
    );
    const [props, change] = React.useState(factory(monitor));
    const dragListener = React.useCallback(
      (monitor: DragMonitor) => {
        const nprops = factory(monitor);
        if (Object.keys(nprops).some(key => nprops[key] !== props[key])) {
          change(nprops);
        }
      },
      [props, change, factory]
    );
    useMonitorListener(dragListener, "dragStart", "drag", "cancel");

    const dropListener = React.useCallback(
      (monitor: DragMonitor) => {
        const nprops = factory(monitor);
        if (Object.keys(nprops).some(key => nprops[key] !== props[key])) {
          change(nprops);
        }
        if (props.isHovered && typeof onDrop === "function") {
          onDrop(props.dragProps);
        }
      },
      [factory, monitor, props, onDrop]
    );
    useMonitorListener(dropListener, "drop");

    return children({ ref, ...props });
  };
}

export default droppable;
