import * as React from "react";

import { DragListener } from "./draggable";
import { DragStats } from "./DragHistoryReducer";
import { emptyFn } from "./utils";

export interface IDraggableContainerContext {
  enhance: (stats: DragStats) => DragStats;
  onDrag: DragListener;
  subscribe: (c: DragListener) => any;
  unsubscribe: (c: DragListener) => any;
}

export const defaultDragDropContext = {
  enhance: (stats: DragStats) => stats,
  onDrag: emptyFn,
  subscribe: emptyFn,
  unsubscribe: emptyFn
};

export const DragDropContext = React.createContext<IDraggableContainerContext>(
  defaultDragDropContext
);

export interface IDragDropContainerChild extends IDraggableContainerContext {
  node: React.RefObject<any>;
}

export interface IDragDropContainerProps {
  className?: string;
  children?: React.FunctionComponent<IDragDropContainerChild> | React.ReactNode;
}

export function dragDropContainer(
  Context: React.Context<IDraggableContainerContext>
) {
  return function DragDropContainerWrapper({
    children,
    className
  }: IDragDropContainerProps) {
    const node = React.useRef<HTMLElement>();
    const state = React.useRef<any>();
    const subs = React.useRef<DragListener[]>([]);

    const onDrag = React.useCallback<DragListener>((dragStats, dragProps) => {
      state.current = { dragStats, dragProps };
      subs.current.forEach(sub => {
        sub(dragStats, dragProps);
      });
    }, []);

    const enhance = React.useCallback(
      (stats: DragStats) => {
        if (!stats.isDragged) {
          return stats;
        }

        const getBounds = () => {
          if (node.current == null || stats.initial == null) {
            return {
              maxX: +Infinity,
              maxY: +Infinity,
              minX: -Infinity,
              minY: -Infinity
            };
          }

          const containerRect = node.current.getBoundingClientRect();
          const draggedRect = (stats.history.length > 1
            ? stats.history[1]
            : stats.initial
          ).rect;

          return {
            maxX: containerRect.right - draggedRect.right,
            maxY: containerRect.bottom - draggedRect.bottom,
            minX: containerRect.left - draggedRect.left,
            minY: containerRect.top - draggedRect.top
          };
        };

        const bounds = getBounds();

        return {
          ...stats,
          x: stats.x
            ? Math.max(Math.min(stats.x, bounds.maxX), bounds.minX)
            : 0,
          y: stats.y ? Math.max(Math.min(stats.y, bounds.maxY), bounds.minY) : 0
        };
      },
      [node]
    );

    const subscribe = React.useCallback(fn => {
      subs.current.push(fn);
    }, []);

    const unsubscribe = React.useCallback(fn => {
      subs.current = subs.current.filter(sub => sub !== fn);
    }, []);

    const value = {
      enhance,
      node,
      onDrag,
      subscribe,
      unsubscribe
    };

    return (
      <Context.Provider value={value}>
        {typeof children === "function" ? (
          children(value)
        ) : (
          <div className={className} ref={node as React.RefObject<any>}>
            {children}
          </div>
        )}
      </Context.Provider>
    );
  };
}

export const DragDropContainer = dragDropContainer(DragDropContext);
