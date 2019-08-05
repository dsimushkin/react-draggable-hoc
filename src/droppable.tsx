import * as React from "react";
import { findDOMNode } from "react-dom";
import { DragMonitor } from "./Monitor";

export interface IDroppableProps {
  dragProps?: any,
  isHovered: boolean,
}

export const containsPoint = (self: React.Component<any>, monitor: DragMonitor) => {
  const el = findDOMNode(self) as HTMLElement;
  const { lastPointer } = monitor.props;
  const x = lastPointer ? lastPointer.pageX : 0;
  const y = lastPointer ? lastPointer.pageY : 0;
  return document.elementsFromPoint(x, y).indexOf(el) >= 0;
}

export interface IDroppablePropTypes {
  isHovered?: (component: React.Component<any>, monitor: DragMonitor) => boolean
  onDrag?: (props: IDroppableProps) => void,
  onDrop?: (props: IDroppableProps) => void,
  children: React.FunctionComponent<any>
}

export const Droppable = (props: IDroppablePropTypes) => (
  props.children({isHovered: false})
)

// export const Droppable = withDragDropContainerContext(
//   class DroppableElement extends React.Component<IDroppablePropTypes & IDraggableContainerContext> {
//     public static defaultProps = {
//       isHovered: containsPoint,
//       onDrag: () => {},
//       onDrop: () => {},
//     }
//     public el?: HTMLElement;
//     public isHovered = false;
//     public isDropped = false;

//     get droppableProps() {
//       const { dragged } = this.props.monitor;
//       return {dragProps: dragged && dragged.props.dragProps, isHovered: this.isHovered};
//     }

//     public onDrag = (monitor: DragMonitor) => {
//       const {props: {draggedNode, lastEvent}} = monitor;
//       this.isHovered = draggedNode != null &&
//                        lastEvent != null &&
//                        this.props.isHovered!(this, monitor);
//       this.props.onDrag!(this.droppableProps);
//       this.forceUpdate();
//     }

//     public onDrop = () => {
//       if (this.isHovered) {
//         this.props.onDrop!(this.droppableProps);
//         this.isHovered = false;
//       }
//       this.forceUpdate();
//     }

//     public onDragEnd = (monitor: DragMonitor) => {
//       this.onDrag(monitor);
//       this.forceUpdate();
//     }

//     public componentDidMount() {
//       this.el = findDOMNode(this) as HTMLElement;
//       const { monitor } = this.props;
//       monitor.on(DragActions.dragStart, this.onDrag);
//       monitor.on(DragActions.drag, this.onDrag);
//       monitor.on(DragActions.beforeDragEnd, this.onDrop);
//       monitor.on(DragActions.dragEnd, this.onDragEnd);
//     }

//     public componentWillUnmount() {
//       const { monitor } = this.props;
//       monitor.off(DragActions.dragStart, this.onDrag);
//       monitor.off(DragActions.drag, this.onDrag);
//       monitor.off(DragActions.beforeDragEnd, this.onDrop);
//       monitor.off(DragActions.dragEnd, this.onDragEnd)
//     }

//     public render() {
//       return this.props.children(this.droppableProps)
//     }
//   },
// )
