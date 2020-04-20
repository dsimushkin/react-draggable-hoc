import * as React from "react";
import * as ReactDOM from "react-dom";

import useDraggableFactory from "./useDraggableFactory";
import useRect from "./useRect";
import DragContext from "./IDragContext";
import HtmlDndObserver from "./HtmlDndObserver";
import { getDeltas } from "./HtmlHelpers";

export function defaultPostProcessor(
  props: any & { container?: React.RefObject<any> },
  ref: React.RefObject<HTMLDivElement>,
) {
  if (ref && ref.current) {
    return {
      ...props,
      ...getDeltas(
        (props.container && props.container.current) || document.body,
        ref.current.getBoundingClientRect(),
        props.deltaX,
        props.deltaY,
      ),
    };
  }

  return props;
}

function Detached({
  children,
  parent,
}: {
  children: React.ReactNode;
  parent: HTMLElement;
}) {
  return ReactDOM.createPortal(
    <React.Fragment>{children}</React.Fragment>,
    parent,
  );
}

/**
 * Generates Draggable div for provided context.
 *
 * @param context DragContext
 */
function draggableFactory<T>(
  context: React.Context<DragContext<T, HtmlDndObserver<T>>>,
) {
  const useDraggable = useDraggableFactory(context);

  return function Draggable({
    dragProps,
    className = "draggable",
    children,
    postProcess = defaultPostProcessor,
    detachDelta = 20,
    delay = 30,
    detachedParent = document.body,
    onDelayedDrag,
    onDragStart,
    onDrag,
    onDragEnd,
    throttleMs,
    disabled,
  }: {
    dragProps: T;
    className?: string;
    postProcess?: (props: any, ref: React.RefObject<HTMLDivElement>) => any; //FIXME
    detachDelta?: number;
    delay?: number;
    detachedParent?: HTMLElement;
    onDelayedDrag?: (state: HtmlDndObserver<T>["state"]) => void;
    onDragStart?: (state: HtmlDndObserver<T>["state"]) => void;
    onDrag?: (state: HtmlDndObserver<T>["state"]) => void;
    onDragEnd?: (state: HtmlDndObserver<T>["state"]) => void;
    throttleMs?: number;
    disabled?: Boolean;
    children?:
      | React.FunctionComponent<{
          handleRef?: React.RefObject<any>;
          isDetached: boolean;
          cancel?: () => void;
        }>
      | React.ReactNode;
  }) {
    const ref = React.useRef<HTMLDivElement>(null);
    const handleRef = React.useRef();
    const props = useDraggable(
      typeof children === "function" ? handleRef : ref,
      {
        disabled,
        dragProps,
        delay,
        onDelayedDrag,
        onDragStart,
        onDrop: onDragEnd,
        onDragCancel: onDragEnd,
        onDrag: onDrag,
        throttleMs,
      },
    );

    const [, size, position] = useRect(ref, [
      delay ? props.isDelayed : props.isDragged,
    ]);

    const { deltaX, deltaY, isDragged } = React.useMemo(
      () => postProcess(props, ref),
      [props, postProcess, ref],
    );

    const isDetached = React.useMemo(
      () =>
        isDragged && Math.max(...[deltaX, deltaY].map(Math.abs)) >= detachDelta,
      [deltaX, deltaY, detachDelta, isDragged],
    );

    return (
      <div
        className={className + (isDragged && isDetached ? " dragged" : "")}
        ref={ref}
      >
        {isDragged && isDetached && detachedParent != null && (
          <Detached parent={detachedParent}>
            <div
              style={{
                transform: `translate3d(${deltaX}px, ${deltaY}px, 1px)`,
                position: "fixed",
                ...size,
                ...position,
              }}
              id="dragged-node-clone"
            >
              {typeof children === "function"
                ? children({ isDetached })
                : children}
            </div>
          </Detached>
        )}
        {typeof children === "function"
          ? children({
              handleRef,
              isDetached,
            })
          : children}
      </div>
    );
  };
}

export default draggableFactory;
