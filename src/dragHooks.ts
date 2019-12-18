import * as React from "react";

import { attach, detach, isDragStart } from "./helpers";
import { DragContext } from "./DragDropContainer";
import { DragEvent } from "./DragMonitor";

export function useForceUpdate(): [() => void, number] {
  const [state, change] = React.useState(0);

  const update = React.useCallback(() => {
    change(state => state + 1);
  }, [change]);

  return [update, state];
}

export function useDraggableFactory(context: typeof DragContext) {
  return function useDraggable(
    ref: React.RefObject<any>,
    { dragProps, delay = 0 }: { dragProps?: any; delay?: number } = {}
  ) {
    const { monitor } = React.useContext(context);
    const [isDragged, change] = React.useState(false);
    const [delayed, changeDelayed] = React.useState();
    const [forceUpdate] = useForceUpdate();
    function cancel() {
      return {
        onTouchStart: (e: Event) => e.stopPropagation(),
        onMouseDown: (e: Event) => e.stopPropagation()
      };
    }

    React.useEffect(() => {
      const node = ref && ref.current;
      const userSelect = node ? node.style.userSelect : undefined;
      function dragStart(e: Event) {
        if (isDragStart(e as DragEvent) && node.contains(e.target)) {
          changeDelayed(e);
        }
      }

      let t: number;
      if (delayed) {
        t = window.setTimeout(() => {
          change(true);
          changeDelayed(undefined);
          monitor.dragStart(delayed);
          monitor.dragProps = dragProps;
        }, delay);
      } else {
        if (node) {
          attach("dragStart", dragStart, node);
          node.style.userSelect = "none";
        }
      }

      return () => {
        clearTimeout(t);
        if (node) {
          detach("dragStart", dragStart, node);
          node.style.userSelect = userSelect;
        }
      };
    }, [delayed, delay, ref, monitor, dragProps, isDragged]);

    React.useEffect(() => {
      if (delayed) {
        const listener = () => {
          changeDelayed(undefined);
        };

        attach("drag", listener);
        attach("drop", listener);

        return () => {
          detach("drag", listener);
          detach("drop", listener);
        };
      } else {
        if (isDragged) {
          const drag = (e: Event) => {
            e.preventDefault();
            monitor.drag(e as DragEvent);
            forceUpdate();
          };

          const drop = (e: Event) => {
            change(false);
            monitor.drop(e as DragEvent);
          };

          attach("drag", drag);
          attach("drop", drop);

          return () => {
            detach("drag", drag);
            detach("drop", drop);
          };
        }
      }

      return undefined;
    }, [isDragged, delayed, monitor, forceUpdate]);

    const r = {
      deltaX: isDragged ? monitor.deltaX : 0,
      deltaY: isDragged ? monitor.deltaY : 0,
      isDragged,
      delayed,
      monitor,
      cancel
    };

    return r;
  };
}

export const useDraggable = useDraggableFactory(DragContext);

export function useRect(ref: React.RefObject<any>, deps: any[] = []) {
  const [rect, changeRect] = React.useState<any>({});
  React.useEffect(() => {
    const node = ref && ref.current;
    changeRect(node.getBoundingClientRect());
  }, deps);

  const [size, position] = React.useMemo(() => {
    const { width, height, left, top } = rect;
    return [
      { width, height },
      { left, top }
    ];
  }, [rect]);

  return [rect, size, position];
}
