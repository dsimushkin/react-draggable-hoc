import * as React from "react";

import DragContext from "./IDragContext";
import useDroppableFactory from "./useDroppableFactory";
import { IHtmlDndObserver } from "./HtmlDndObserver";
import { defaultDroppableMethod } from "./HtmlMethods";

function droppableFactory<T>(
  context: React.Context<DragContext<T, IHtmlDndObserver<T>>>,
) {
  const useDroppable = useDroppableFactory(context);

  return function Droppable({
    children,
    method = defaultDroppableMethod,
    onDrop,
    disabled = false,
  }: {
    children: React.FunctionComponent<{
      ref: React.RefObject<any>;
      dragProps: any;
      isHovered: Boolean;
    }>;
    method?: typeof defaultDroppableMethod;
    onDrop?: (dragProps: any) => void;
    disabled?: boolean;
  }) {
    const ref = React.useRef<any>();
    const props = useDroppable(ref, { method, disabled, onDrop });

    return children({ ref, ...props });
  };
}

export default droppableFactory;
