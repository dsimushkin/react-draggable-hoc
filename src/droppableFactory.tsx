import * as React from "react";

import DragContext from "./IDragContext";
import useDroppableFactory from "./useDroppableFactory";
import { IDndObserver } from "./IDndObserver";
import useDragPropsFactory from "./useDragPropsFactory";

function droppableFactory<T, D extends IDndObserver<T, any, any, any>>(
  context: React.Context<DragContext<T, D>>,
) {
  const useDroppable = useDroppableFactory(context);
  const useDragProps = useDragPropsFactory(context);

  return function Droppable({
    children,
    withDragProps = true,
    ...droppableProps
  }: {
    children: React.FunctionComponent<
      {
        ref: React.RefObject<any>;
        dragProps?: T;
      } & ReturnType<typeof useDroppable>
    >;
    withDragProps?: boolean;
  } & Parameters<typeof useDroppable>[1]) {
    const ref = React.useRef<any>();

    const props = useDroppable(ref, droppableProps);
    const dragProps = useDragProps({ disabled: !withDragProps });

    return children({ ref, dragProps, ...props });
  };
}

export default droppableFactory;
