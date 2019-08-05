import * as React from "react";

import { DragStats, dragStatsFactory } from "./DragHistoryReducer";
import { emptyFn } from "./utils";

export interface IDraggableContainerContext {
  isDragged: boolean,
  dragProps?: any,
  x?: number,
  y?: number,
  onDrag: (dragProps: any, stats: DragStats) => any,
}

export const DragDropContext = React.createContext<IDraggableContainerContext>({
  isDragged: false,
  onDrag: emptyFn,
})

export interface IDragDropContainerChild {
  node: React.RefObject<any>,
  x?: number,
  y?: number,
  isDragged: boolean,
  dragProps?: any
}

export function DragDropContainer({
  children,
}: {
  children: React.FunctionComponent<IDragDropContainerChild>,
}) {
  const node = React.useRef<HTMLElement>();
  const [state, updateStats] = React.useState<DragStats>(dragStatsFactory());
  const [dragProps, updateDragProps] = React.useState<any>();

  const onDrag = (props: any, stats: DragStats) => {
    updateDragProps(props);
    updateStats(stats);
  }

  const bounds = React.useMemo(
    () => {
      if (node.current == null || state.node == null) {
        return {
          maxX: +Infinity,
          maxY: +Infinity,
          minX: -Infinity,
          minY: -Infinity,
        }
      }

      const containerRect = node.current.getBoundingClientRect();
      const draggedRect = state.node.getBoundingClientRect();

      return {
        maxX: containerRect.right - draggedRect.right,
        maxY: containerRect.bottom - draggedRect.bottom,
        minX: containerRect.left - draggedRect.left,
        minY: containerRect.top - draggedRect.top,
      }
    },
    [state.node, node.current],
  )

  const x = state.x ? Math.max(Math.min(state.x, bounds.maxX), bounds.minX) : 0;
  const y = state.y ? Math.max(Math.min(state.y, bounds.maxY), bounds.minY) : 0;

  return (
    <DragDropContext.Provider
      value={{
        dragProps,
        isDragged: state.isDragged,
        onDrag,
        x,
        y,
      }}
    >
      {children({
        dragProps,
        isDragged: state.isDragged,
        node,
        x,
        y,
      })}
    </DragDropContext.Provider>
  )
}
