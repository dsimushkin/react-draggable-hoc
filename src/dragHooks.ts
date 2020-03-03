import * as React from "react";

import { attach, detach, isDragEvent, isDragStart, DragPhase } from "./helpers";
import { DragContext } from "./DragDropContainer";
import { DragEvent } from "./DragMonitor";

export function useDragStopPropagation(
  ref: React.RefObject<any>,
  ...phases: DragPhase[]
) {
  React.useEffect(() => {
    const stopPropagation = (e: Event) => e.stopPropagation();

    const node = ref && ref.current;
    if (node) {
      phases.forEach(phase => {
        attach(phase, stopPropagation, node);
      });
    }

    return () => {
      if (node) {
        phases.forEach(phase => {
          detach(phase, stopPropagation, node);
        });
      }
    };
  });
}

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

    const cancelDrag = React.useCallback(
      (e, force = false) => {
        if (delayed) changeDelayed(undefined);
        if (isDragged) {
          change(false);
          monitor[force ? "cancel" : "drop"](e as DragEvent);
        }
      },
      [isDragged, delayed, change, monitor, changeDelayed]
    );

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
        attach("drag", cancelDrag);
        attach("drop", cancelDrag);

        return () => {
          detach("drag", cancelDrag);
          detach("drop", cancelDrag);
        };
      } else {
        if (isDragged) {
          const drag = (e: any) => {
            e.preventDefault();
            if (!isDragEvent(e as DragEvent)) {
              cancelDrag(e, true);
            } else {
              monitor.drag(e as DragEvent);
            }
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
      monitor
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
