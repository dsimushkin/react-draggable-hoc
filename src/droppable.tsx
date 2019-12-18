import * as React from "react";

import { DragContext } from "./DragDropContainer";
import { DragMonitor } from "./DragMonitor";

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

export function dropable(context: typeof DragContext) {
  return function Droppable({
    children,
    method = defaultDroppableMethod,
    onDrop
  }: {
    children: React.FunctionComponent<any>;
    method?: typeof defaultDroppableMethod;
    onDrop?: (dragProps: any) => void;
  }) {
    const { monitor } = React.useContext(context);
    const ref = React.useRef<any>();
    const factory = React.useCallback(
      monitor => ({
        isHovered: monitor.dragProps ? method(monitor, ref) : false,
        dragProps: monitor.dragProps
      }),
      [method]
    );
    const [props, change] = React.useState(factory(monitor));

    React.useEffect(() => {
      const node = ref.current;
      const listener = (monitor: DragMonitor) => {
        const nprops = factory(monitor);

        if (
          props.isHovered !== nprops.isHovered ||
          props.dragProps !== nprops.dragProps
        ) {
          change(nprops);
        }

        if (
          typeof onDrop === "function" &&
          props.isHovered &&
          nprops.dragProps == null
        ) {
          onDrop(props.dragProps);
        }

        if (node != null && nprops.isHovered !== props.isHovered) {
          if (nprops.isHovered) {
            monitor.over(node);
          } else {
            monitor.out(node);
          }
        }
      };

      monitor.on("propsChange", listener);
      monitor.on("drag", listener);

      return () => {
        monitor.off("propsChange", listener);
        monitor.off("drag", listener);
      };
    }, [props, factory, onDrop]);

    return children({ ref, ...props });
  };
}

export const Droppable = dropable(DragContext);
