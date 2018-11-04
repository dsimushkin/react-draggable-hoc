import * as React from "react";
import { findDOMNode } from "react-dom";
import { DraggableComponent, IDraggableContainerContext, withDraggable } from "./DraggableContainer";
import { DragActions, DraggableMonitor } from "./Monitor";

export interface IDroppableProps {
  dragged?: DraggableComponent,
  isDropped?: boolean,
  isHovered?: boolean,
}

const containsPoint = (
  component: React.Component<any>,
  { x, y }: { x: number, y: number },
) => {
  const rect = (findDOMNode(component) as HTMLElement).getBoundingClientRect();

  return rect.left <= x
    && rect.right >= x
    && rect.top <= y
    && rect.bottom >= y
}

const getLastEventAsPoint = ({ props: {lastEvent} }: DraggableMonitor) => ({
  x: lastEvent ? lastEvent.pageX : 0,
  y: lastEvent ? lastEvent.pageY : 0,
});

export const droppable = <T extends any>(
  WrappedComponent: React.ComponentType<T & IDroppableProps>,
  isHovered?: (component: React.Component<any>, monitor: DraggableMonitor) => boolean,
) => (
  withDraggable(droppableWrapper(WrappedComponent, isHovered))
)

const droppableWrapper = <T extends any>(
  WrappedComponent: React.ComponentType<T & IDroppableProps>,
  isHovered?: (component: React.Component<any>, monitor: DraggableMonitor) => boolean,
) => (
  class DroppableWrapper extends React.Component<T & IDraggableContainerContext> {
    public el?: HTMLElement;

    public state = {
      isDropped: false,
      isHovered: false,
    }

    public containsPoint = (self: React.Component<any> = this, monitor: DraggableMonitor) => {
      return containsPoint(self, getLastEventAsPoint(monitor));
    }

    public onDrag = (monitor: DraggableMonitor) => {
      const {props: {dragged, lastEvent}} = monitor;
      const hovered = dragged && lastEvent && (isHovered || this.containsPoint)(this, monitor);

      if (this.state.isHovered !== hovered) {
        this.setState({isHovered: hovered});
      }
    }

    public onDragStart = (monitor: DraggableMonitor) => {
      this.onDrag(monitor);
      this.forceUpdate();
    }

    public onDragEnd = () => {
      this.setState({isHovered: false, isDropped: false});
    }

    public onDrop = () => {
      if (this.state.isHovered) {
        this.setState({isDropped: true});
      }
    }

    public componentDidMount() {
      this.el = findDOMNode(this) as HTMLElement;
      const { monitor } = this.props;
      monitor.on(DragActions.dragStart, this.onDragStart);
      monitor.on(DragActions.drag, this.onDrag);
      monitor.on(DragActions.beforeDragEnd, this.onDrop);
      monitor.on(DragActions.dragEnd, this.onDragEnd);
    }

    public componentWillUnmount() {
      const { monitor } = this.props;
      monitor.off(DragActions.dragStart, this.onDragStart);
      monitor.off(DragActions.drag, this.onDrag);
      monitor.off(DragActions.beforeDragEnd, this.onDrop);
      monitor.off(DragActions.dragEnd, this.onDragEnd);
    }

    public render() {
      const { monitor, ...props } = this.props as any;

      return (
        <WrappedComponent
          {...props}
          {...this.state}
          dragged={monitor.dragged}
        />
      )
    }
  }
)

export interface IDroppablePropTypes {
  onDrag: (props: IDroppableProps) => void,
  onDrop: (props: IDroppableProps) => void,
}

export const Droppable = droppable(
  class DroppableElement extends React.Component<IDroppableProps & IDroppablePropTypes> {
    public static defaultProps = {
      onDrag: () => {},
      onDrop: () => {},
    }

    public componentDidUpdate(prevProps: IDroppableProps) {
      const {dragged, isDropped, isHovered} = this.props;
      if (!prevProps.isDropped &&
        dragged && isDropped
      ) {
        this.props.onDrop({dragged, isDropped, isHovered});
      }

      if (prevProps.isHovered !== isHovered || prevProps.dragged !== dragged) {
        this.props.onDrag({dragged, isDropped, isHovered});
      }
    }

    public render() {
      return React.Children.only(this.props.children)
    }
  },
)
