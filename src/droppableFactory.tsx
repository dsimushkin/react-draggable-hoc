import * as React from "react";

import DragContext from "./IDragContext";
import useDroppableFactory from "./useDroppableFactory";
import { IDndObserver } from "./IDndObserver";

function droppableFactory<T, D extends IDndObserver<T, any, any>>(
  context: React.Context<DragContext<T, D>>,
) {
  const useDroppable = useDroppableFactory(context);

  return function Droppable({
    children,
    method,
    onDrop,
    disabled = false,
  }: {
    children: React.FunctionComponent<{
      ref: React.RefObject<any>;
      dragProps: T;
      isHovered: Boolean;
    }>;
  } & Parameters<typeof useDroppable>[1]) {
    const ref = React.useRef<any>();

    const props = useDroppable(ref, {
      method,
      disabled,
      onDrop,
    });

    return children({ ref, ...props });
  };
}

export default droppableFactory;
