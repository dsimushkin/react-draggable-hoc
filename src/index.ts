import droppable from "./droppable";
import draggable from "./draggable";
import dragDropContainer, { DragContext } from "./dragDropContainer";
import useDraggableFactory from "./useDraggableFactory";
import useMonitorListenerFactory from "./useMonitorListenerFactory";

export { default as useDragStopPropagation } from "./useDragStopPropagation";
export { defaultPostProcessor } from "./draggable";
export { defaultDroppableMethod } from "./droppable";

export const useDraggable = useDraggableFactory(DragContext);
export const useMonitorListener = useMonitorListenerFactory(DragContext);

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
