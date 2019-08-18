import * as React from "react";

import { DragDropContext, IDraggableContainerContext } from "./DragDropContainer";
import DragHistoryReducer, { dragPayloadFactory, DragStats, dragStatsFactory, IDragEvent } from "./DragHistoryReducer";
import * as utils from "./utils";

export type DragListener = (stats: DragStats, dragProps: any) => any

export interface IDraggablePropTypes {
  delay?: number
  onDrag?: DragListener
  onDragStart?: DragListener
  onDragEnd?: (event: IDragEvent) => any
  dragProps?: any
  children?: React.FunctionComponent<IDraggableChild> | React.ReactNode
  className?: string
}

export interface IDraggableChild extends DragStats {
  delayedDrag?: IDragEvent
  nodeRef: React.RefObject<any>
  dragHandleRef: React.RefObject<any>
  isDragged: boolean
  dragStartListener: (e: Event) => any
}

export function draggable(dragDropContext: React.Context<IDraggableContainerContext>) {
  return function DraggableElement({
    dragProps,
    delay,
    onDrag,
    onDragEnd,
    onDragStart,
    children,
    className,
  }: IDraggablePropTypes) {
    const nodeRef = React.useRef<HTMLElement>(null);
    const dragHandleRef = React.useRef<HTMLElement>(null);
    const [dragHistory, dispatch] = React.useReducer(DragHistoryReducer, []);
    const [delayedDrag, changeDelayedDrag] = React.useState<IDragEvent>();

    const context = React.useContext(dragDropContext);

    const dragStats = React.useMemo(
      () => context.enhance(dragStatsFactory(dragHistory)),
      [dragHistory],
    );

    React.useEffect(
      () => {
        context.onDrag(dragStats, dragProps);
      },
      [dragStats],
    )

    const isDragged = React.useMemo(
      () => dragHistory.length > 0,
      [dragHistory.length],
    );

    React.useEffect(
      () => {
        let t: number;
        if (delayedDrag) {
          t = setTimeout(() => {
            try {
              dispatch({type: "dragStart", payload: delayedDrag});
              changeDelayedDrag(undefined);
              if (typeof onDragStart === "function") {
                onDragStart(dragProps, dragStats);
              }
            } catch (e) {
              dispatch({type: "drop"});
            }
          }, delay)
        }

        return () => {
          clearTimeout(t);
        }
      },
      [delayedDrag],
    )

    React.useEffect(
      () => {
        const removeEventListeners = (
          dl: EventListener,
          del: EventListener,
        ) => () => {
          window.removeEventListener("mousemove", dl, true);
          window.removeEventListener("mouseup", del, true);
          window.removeEventListener("touchend", del, true);
          window.removeEventListener("touchmove", dl, true);
        }

        const drag = (event: Event) => {
          if (delayedDrag) {
            changeDelayedDrag(undefined);
          } else if (dragStats.current != null) {
            const payload = dragPayloadFactory(event as utils.DragEvent, dragStats.current.node);
            dispatch({type: "drag", payload});
            if (typeof onDrag === "function") {
              onDrag(dragStats, dragProps);
            }
          }
        }

        const dragEnd = (event: Event) => {
          if (delayedDrag) {
            changeDelayedDrag(undefined);
          } else if (dragStats.current != null) {
            removeEventListeners(drag, dragEnd)();
            const payload = dragPayloadFactory(event as utils.DragEvent, dragStats.current.node);
            dispatch({type: "drop"});
            if (typeof onDragEnd === "function") {
              onDragEnd(payload);
            }
          }
        }

        if (isDragged || delayedDrag) {
          window.addEventListener("mouseup", dragEnd, true);
          window.addEventListener("touchend", dragEnd, true);
          window.addEventListener("mousemove", drag, true);
          window.addEventListener("touchmove", drag, true);
        }

        return removeEventListeners(drag, dragEnd);
      },
      [isDragged, delayedDrag],
    )

    const dragStart = React.useCallback(
      (event: Event) => {
        const {currentTarget: target} = event;
        if (target && utils.isDragStart(event as utils.DragEvent)) {
          event.preventDefault();
          if (event.type === "mousedown") {
          }

          const payload = dragPayloadFactory(event as utils.DragEvent, nodeRef.current || target as HTMLElement);
          changeDelayedDrag(payload);
        }
      },
      [dispatch, onDragStart],
    );

    React.useEffect(
      () => {
        const node = dragHandleRef.current || nodeRef.current;
        if (node) {
          node.addEventListener("touchstart", dragStart, true);
          node.addEventListener("mousedown", dragStart, true);
        }

        return () => {
          if (node) {
            node.removeEventListener("touchstart", dragStart, true);
            node.removeEventListener("mousedown", dragStart, true);
          }
        }
      },
      [],
    )

    if (typeof children === "function") {
      return children({
        delayedDrag,
        dragHandleRef,
        dragStartListener: dragStart,
        nodeRef,
        ...dragStats,
      })
    } else {
      return (
        <div
          style={{
              transform: isDragged ? `translate3d(${dragStats.x}px, ${dragStats.y}px, -1px)` : undefined,
              transition: isDragged ? undefined : "transform 1s",
          }}
          className={className}
          ref={nodeRef as React.RefObject<any>}
        >
          {children}
        </div>
      )
    }
  }
}

export const Draggable = draggable(DragDropContext);
