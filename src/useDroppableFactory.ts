import * as React from "react";

import DragContext from "./IDragContext";
import useDndObserverListenerFactory from "./useDndObserverListenerFactory";
import { ISharedState } from "./IDndObserver";
import { HtmlDragPayload } from "./HtmlDndObserver";

export function defaultDroppableMethod<T>(
  state: ISharedState<T, HtmlDragPayload>,
  ref: React.RefObject<any>,
) {
  const node = ref.current;
  if (state.current && node) {
    const { x, y } = state.current;
    return document.elementsFromPoint(x, y).indexOf(node) >= 0;
  }

  return false;
}

function useDroppableFactory<T, HtmlDragPayload>(
  context: React.Context<DragContext<T, HtmlDragPayload>>,
) {
  const useDndObserverListener = useDndObserverListenerFactory(context);
  type SharedState = ISharedState<T, HtmlDragPayload>;

  return function useDroppable(
    ref: React.RefObject<any>,
    {
      method = defaultDroppableMethod,
      onDrop,
      disabled = false,
    }: {
      method?: typeof defaultDroppableMethod;
      onDrop?: (dragProps: any) => void;
      disabled?: boolean;
    },
  ) {
    const { observer } = React.useContext(context);
    const factory = React.useCallback(
      (state: SharedState) => ({
        isHovered:
          state.dragProps != null && !disabled && typeof method === "function"
            ? method(state as any, ref)
            : false,
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

    return props;
  };
}

export default useDroppableFactory;
