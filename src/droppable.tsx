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
        isHovered: monitor.dragProps ? method(monitor, ref) : false,
        dragProps: monitor.dragProps
      }),
      [method]
    );
    const [props, change] = React.useState(factory(monitor));

    React.useEffect(() => {
      const node = ref.current;

      if (node != null) {
        if (props.isHovered) {
          monitor.over(node);
        } else {
          monitor.out(node);
        }
      }

      const listener =
        typeof onDrop === "function" && props.isHovered
          ? () => {
              onDrop(monitor.dragProps);
              change(factory(monitor));
            }
          : undefined;

      if (listener != null) monitor.on("drop", listener);

      return () => {
        if (listener != null) monitor.off("drop", listener);
      };
    }, [props]);

    React.useEffect(() => {
      const listener = (monitor: DragMonitor) => {
        const nprops = factory(monitor);

        if (
          props.isHovered !== nprops.isHovered ||
          props.dragProps !== nprops.dragProps
        ) {
          change(nprops);
        }
      };
      if (!disabled) {
        monitor.on("propsChange", listener);
        monitor.on("drag", listener);
      }

      return () => {
        if (!disabled) {
          monitor.off("propsChange", listener);
          monitor.off("drag", listener);
        }
      };
    }, [disabled, props]);

    return children({ ref, ...props });
  };
}

export const Droppable = dropable(DragContext);
