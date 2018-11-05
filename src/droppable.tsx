import * as React from "react";
import { findDOMNode } from "react-dom";
import { IDraggableContainerContext, withDraggableContainer } from "./DraggableContainer";
import { DragActions, DragMonitor } from "./Monitor";

export interface IDroppableProps {
  dragProps?: any,
  isHovered: boolean,
}

export const containsPoint = (self: React.Component<any>, monitor: DragMonitor) => {
  const rect = (findDOMNode(self) as HTMLElement).getBoundingClientRect();
  const { lastEvent } = monitor.props;
  const x = lastEvent ? lastEvent.pageX : 0;
  const y = lastEvent ? lastEvent.pageY : 0;
  return rect.left <= x
    && rect.right >= x
    && rect.top <= y
    && rect.bottom >= y;
}

export interface IDroppablePropTypes {
  isHovered?: (component: React.Component<any>, monitor: DragMonitor) => boolean
  onDrag?: (props: IDroppableProps) => void,
  onDrop?: (props: IDroppableProps) => void,
  children: React.ReactNode
}

export const Droppable = withDraggableContainer(
  class DroppableElement extends React.Component<IDroppablePropTypes & IDraggableContainerContext> {
    public static defaultProps = {
      isHovered: containsPoint,
      onDrag: () => {},
      onDrop: () => {},
    }
    public el?: HTMLElement;
    public isHovered = false;
    public isDropped = false;

    get droppableProps() {
      const { dragged } = this.props.monitor;
      return {dragProps: dragged && dragged.props.dragProps, isHovered: this.isHovered};
    }

    public onDrag = (monitor: DragMonitor) => {
      const {props: {draggedNode, lastEvent}} = monitor;
      this.isHovered = draggedNode != null &&
                       lastEvent != null &&
                       this.props.isHovered!(this, monitor);
      this.props.onDrag!(this.droppableProps);
    }

    public onDrop = () => {
      if (this.isHovered) {
        this.props.onDrop!(this.droppableProps);
        this.isHovered = false;
      }
    }

    public onDragEnd = (monitor: DragMonitor) => {
      this.onDrag(monitor);
    }

    public componentDidMount() {
      this.el = findDOMNode(this) as HTMLElement;
      const { monitor } = this.props;
      monitor.on(DragActions.dragStart, this.onDrag);
      monitor.on(DragActions.drag, this.onDrag);
      monitor.on(DragActions.beforeDragEnd, this.onDrop);
      monitor.on(DragActions.dragEnd, this.onDragEnd);
    }

    public componentWillUnmount() {
      const { monitor } = this.props;
      monitor.off(DragActions.dragStart, this.onDrag);
      monitor.off(DragActions.drag, this.onDrag);
      monitor.off(DragActions.beforeDragEnd, this.onDrop);
      monitor.off(DragActions.dragEnd, this.onDragEnd)
    }

    public render() {
      return this.props.children
    }
  },
)
