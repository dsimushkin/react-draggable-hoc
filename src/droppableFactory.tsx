import * as React from "react";

import DragContext from "./IDragContext";
import useDndObserverListenerFactory from "./useDndObserverListenerFactory";
import { ISharedState } from "./IDndObserver";
import { HtmlDragPayload } from "./HtmlDndObserver";

export function defaultDroppableMethod<T>(
  state: ISharedState<T, HtmlDragPayload>,
  ref: React.RefObject<any>,
) {
  if (state.current && ref.current) {
    const { x, y } = state.current;
    return document.elementsFromPoint(x, y).indexOf(ref.current) >= 0;
  }

  return false;
}

function droppableFactory<T, HtmlDragPayload>(
  context: React.Context<DragContext<T, HtmlDragPayload>>,
) {
  const useDndObserverListener = useDndObserverListenerFactory(context);
  type SharedState = ISharedState<T, HtmlDragPayload>;
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
    const { observer } = React.useContext(context);
    const ref = React.useRef<any>();
    const factory = React.useCallback(
      (state: SharedState) => ({
        isHovered:
          state.dragProps && !disabled ? method(state as any, ref) : false,
        dragProps: state.dragProps,
      }),
      [method, observer, disabled],
    );
    const [props, change] = React.useState(factory(observer.state));
    const dragListener = React.useCallback(
      (state: SharedState) => {
        const nprops = factory(state);
        if (Object.keys(nprops).some(key => nprops[key] !== props[key])) {
          change(nprops);
        }
      },
      [props, change, factory],
    );
    useDndObserverListener(dragListener, "dragStart", "drag", "cancel");

    const dropListener = React.useCallback(
      (state: SharedState) => {
        const nprops = {
          dragProps: undefined,
          isHovered: false,
        };

        if (Object.keys(nprops).some(key => nprops[key] !== props[key])) {
          change(nprops);
        }
        if (props.isHovered && typeof onDrop === "function") {
          onDrop(props.dragProps);
        }
      },
      [factory, observer, props, onDrop],
    );
    useDndObserverListener(dropListener, "drop");

    return children({ ref, ...props });
  };
}

export default droppableFactory;
