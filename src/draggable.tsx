import * as React from "react";
import { findDOMNode } from "react-dom";

import DragHistoryReducer, { dragPayloadFactory, dragStatsFactory, IDragEvent } from "./DragHistoryReducer";
import { DragDropContext } from "./internals";
import * as utils from "./utils";

export interface IDraggablePropTypes {
  delay?: number,
  disabled?: boolean,
  draggable?: boolean,
  onDrag?: (event: IDragEvent) => any,
  onDragStart?: (event: IDragEvent) => any,
  onDragEnd?: (event: IDragEvent) => any,
  dragProps?: any,
}

export interface IDraggableContext {
  subscribe: (component: IDraggableArea) => any,
  unsubscribe: (component: IDraggableArea) => any,
}

export interface IDraggableArea {
  el: ReturnType<typeof findDOMNode>,
  draggable: boolean,
}

export interface IDraggableChild {
  node: React.RefObject<any>,
  isDragged: boolean,
  x: number,
  y: number
}

const DraggableContext = React.createContext<IDraggableContext>({
  subscribe: () => {},
  unsubscribe: () => {},
});

export function Draggable({
  disabled = false,
  draggable = true,
  dragProps,
  onDrag,
  onDragEnd,
  onDragStart,
  children,
}: IDraggablePropTypes & {children: React.FunctionComponent<IDraggableChild>}) {
  const [dragHistory, dispatch] = React.useReducer(DragHistoryReducer, []);

  const dragAreas = React.useRef<IDraggableArea[]>([]);
  const node = React.useRef<HTMLElement>(null);

  const dragStats = React.useMemo(
    () => dragStatsFactory(dragHistory),
    [dragHistory],
  );
  const isDragged = React.useMemo(
    () => dragHistory.length > 0,
    [dragHistory.length],
  );

  const context = React.useContext(DragDropContext);
  React.useEffect(
    () => {
      context.onDrag(dragProps, dragStats);
    },
    [dragStats],
  )

  React.useEffect(
    () => {
      const drag = (event: Event) => {
        const payload = dragPayloadFactory(event as utils.DragEvent);
        dispatch({type: "drag", payload});
        if (typeof onDrag === "function") {
          onDrag(payload);
        }
      }

      const removeEventListeners = () => {
        window.removeEventListener("mousemove", drag, true);
        window.removeEventListener("touchmove", drag, true);
        window.removeEventListener("mouseup", dragEnd, true);
        window.removeEventListener("touchend", dragEnd, true);
      }

      const dragEnd = (event: Event) => {
        removeEventListeners();
        const payload = dragPayloadFactory(event as utils.DragEvent);
        dispatch({type: "drop"});
        if (typeof onDragEnd === "function") {
          onDragEnd(payload);
        }
      }

      if (isDragged) {
        window.addEventListener("mouseup", dragEnd, true);
        window.addEventListener("touchend", dragEnd, true);
        window.addEventListener("mousemove", drag, true);
        window.addEventListener("touchmove", drag, { passive: true });
      }

      return removeEventListeners;
    },
    [isDragged],
  )

  React.useEffect(
    () => {
      const elem = node ? node.current : undefined;

      if (elem) {
        const dragStart = (event: Event) => {
          if (disabled) {
            return;
          }

          const {target} = event;
          if (target && utils.isDragStart(event as utils.DragEvent)) {
            // define draggable area
            const area = dragAreas.current
              .filter(({el}) => el != null && el.contains(target as Node))
              .reduce(
                (prev: IDraggableArea | undefined, next) => !prev || prev.el!.contains(next.el) ? next : prev,
                undefined,
              );

            const isDrag = area && area.draggable;

            if (isDrag) {
              if (event.type === "mousedown") {
                event.preventDefault();
              }

              try {
                const payload = dragPayloadFactory(event as utils.DragEvent);
                dispatch({type: "dragStart", payload});
                if (typeof onDragStart === "function") {
                  onDragStart(payload);
                }
              } catch (e) {
                dispatch({type: "drop"});
              }
            }
          }
        }

        elem.addEventListener("mousedown", dragStart, true);
        elem.addEventListener("touchstart", dragStart, true);

        return () => {
          elem.removeEventListener("mousedown", dragStart, true);
          elem.removeEventListener("touchstart", dragStart, true);
        }
      }

      return undefined;
    },
  );

  return (
    <DraggableContext.Provider value={{
      subscribe: (dragArea: IDraggableArea) => {
        if (dragAreas.current.every((v) => v.el !== dragArea.el)) {
          dragAreas.current.push(dragArea);
        }
      },
      unsubscribe: (dragArea: IDraggableArea) => {
        dragAreas.current = dragAreas.current.filter((v) => v.el !== dragArea.el);
      },
    }}>
      <DraggableArea
        draggable={draggable}
        ref={node}
      >
        {({node: ref}) => (
          children({
            ...dragStats,
            node: ref,
          })
        )}
      </DraggableArea>
    </DraggableContext.Provider>
  )
}

export const DraggableArea = React.forwardRef((
  {
    draggable = true,
    children,
  }: {
    children: React.FunctionComponent<{node: React.RefObject<any>}>,
    draggable: boolean,
  },
  ref,
) => {
  const {subscribe, unsubscribe} = React.useContext(DraggableContext);
  const node = React.useRef<HTMLElement>(null);

  React.useEffect(
    () => {
      const draggableArea = {
        el: node.current,
        get draggable() {
          return draggable;
        },
      }

      subscribe(draggableArea);

      return () => {
        unsubscribe(draggableArea);
      }
    },
  );

  React.useImperativeHandle(ref, () => node.current);

  return children({node});
})
