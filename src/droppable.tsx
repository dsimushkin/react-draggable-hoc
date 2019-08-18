import * as React from "react";

import { DragDropContext, IDraggableContainerContext } from "./DragDropContainer";
import { DragListener } from "./draggable";
import { containsPointer, HoverMethod } from "./utils";

export interface IDroppableChildProps {
  dragProps: any
  isHovered: boolean
  nodeRef: React.RefObject<any>
}

export interface IDroppablePropTypes {
  onDrop?: (props: any) => any
  method?: HoverMethod
  children: React.FunctionComponent<IDroppableChildProps>
}

export function droppable(dragDropContext: React.Context<IDraggableContainerContext>) {
  return function DroppableWrapper({
      onDrop,
      children,
      method = containsPointer,
  }: IDroppablePropTypes) {
    const [dragStats, changeStats] = React.useState<any>();
    const [dragProps, changeProps] = React.useState<any>();
    const {subscribe, unsubscribe} = React.useContext(dragDropContext);

    React.useEffect(
      () => {
        const listener: DragListener = (stats, props) => {
          changeStats(stats);
          changeProps(props);
        }

        subscribe(listener);

        return () => {
          unsubscribe(listener);
        }
      },
      [],
    );

    const [isHovered, changeHovered] = React.useState(false);
    const nodeRef = React.useRef<HTMLElement>();

    React.useEffect(
      () => {
        if (method(nodeRef, dragStats) !== isHovered) {
          changeHovered(!isHovered);
          if (isHovered && dragStats.current == null && typeof onDrop === "function") {
            onDrop(dragProps);
          }
        }
      },
      [nodeRef, dragStats, method],
    )

    return children({
      dragProps,
      isHovered,
      nodeRef,
    });
  }
}

export const Droppable = droppable(DragDropContext);
