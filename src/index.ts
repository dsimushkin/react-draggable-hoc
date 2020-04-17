import * as React from "react";
import droppable from "./droppableFactory";
import draggable from "./draggableFactory";
import dragDropContainer from "./dragDropContainerFactory";
import useDraggableFactory from "./useDraggableFactory";
import useDroppableFactory from "./useDroppableFactory";
import useDndObserverListenerFactory from "./useDndObserverListenerFactory";
import withDndContextFactory from "./withDndContextFactory";
import DragContextType from "./IDragContext";
import HtmlDndObserver from "./HtmlDndObserver";
import withDragPropsFactory from "./withDragPropsFactory";
import useDragPropsFactory from "./useDragPropsFactory";

export { defaultPostProcessor } from "./draggableFactory";
export { defaultDroppableMethod } from "./HtmlMethods";
export { default as DragContextType } from "./IDragContext";
export * from "./helpers";

export function DragContextFactory<T>() {
  return React.createContext<DragContextType<T, HtmlDndObserver<T>>>({
    observer: new HtmlDndObserver<T>(),
    container: undefined,
    defaultDroppableMethod(state, ref) {
      const node = ref.current;
      if (state.current && node) {
        const { x, y } = state.current;
        return document.elementsFromPoint(x, y).indexOf(node) >= 0;
      }

      return false;
    },
  });
}

export const DragContext = DragContextFactory<any>();

export const useDraggable = useDraggableFactory(DragContext);
export const useDroppable = useDroppableFactory(DragContext);
export const useDndObserverListener = useDndObserverListenerFactory(
  DragContext,
);

/**
 * Requires DragDropContainer with the same DragContext.
 *
 * Droppable React Component
 */
export const Droppable = droppable(DragContext);

/**
 * Requires DragDropContainer with the same DragContext.
 *
 * Generates a div which will be used as draggable reference
 * when child is not a functional component
 * and this div will be used to make dragged component
 * remain inside DragDropContainer.
 *
 * Children will be rendered twice:
 * for base and for dragged elements.
 * For a functional child component base instance will
 * be provided by handleRef parameter,
 * while dragged instance will not.
 *
 * This component uses ReactDOM.createPortal to mount
 * the dragged instance with a position fixed.
 *
 * @prop {any} dragProps - drag indicator
 * @prop {string} className
 * @prop {React.FunctionComponent<IDraggableChild> | React.ReactNode} children
 * @prop {(props: any, ref: React.RefObject<HTMLDivElement>) => any} postProcess //FIXME
 * @prop {number} detachDelta
 * @prop {number} delay
 * @prop {HTMLElement} detachedParent
 * @prop {any} key
 */
export const Draggable = draggable(DragContext);

export const DragDropContainer = dragDropContainer(DragContext);

/**
 * A HOC to inject DragContext as props into a Component
 */
export const withDndContext = withDndContextFactory(DragContext);
export const WithDragProps = withDragPropsFactory(DragContext);
export const useDragProps = useDragPropsFactory(DragContext);
