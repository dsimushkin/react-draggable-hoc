import * as React from "react";
import { findDOMNode } from "react-dom";
import { IDraggableContext, IDraggableProps, withDraggable } from "./DraggableContainer";
import { CallbackEvent, DraggableMonitor } from "./Monitor";
import { DragEvent, isDrag } from "./utils";

export const draggable = <T extends any>(
  WrappedComponent: React.ComponentType<T & IDraggableProps>,
) => (
  withDraggable(draggableWrapper(WrappedComponent))
)

const draggableWrapper = <T extends any>(
  WrappedComponent: React.ComponentType<T & IDraggableProps>,
) => (
  class DraggableWrapper extends React.Component<T & IDraggableContext> {
    public el?: HTMLElement;

    public state = {
      isDragged: false,
    }

    public onDragStart = (event: Event) => {
      if (isDrag(event as DragEvent) && this.el!.contains(event.target as HTMLElement)) {
        this.props.monitor.dragStart(this, event as DragEvent);
        this.setState({isDragged: true});
      }
    }

    public onDrag = (monitor: DraggableMonitor) => {
      if (monitor.dragged === this) {
        this.forceUpdate();
      }
    }

    public onDragEnd = (monitor: DraggableMonitor) => {
      if (this.state.isDragged) {
        this.setState({isDragged: false});
      }
    }

    public componentDidMount() {
      this.el = findDOMNode(this) as HTMLElement;
      this.el.addEventListener("mousedown", this.onDragStart, true);

      // TODO move to draggable Handle
      // prevent pointer interactions
      this.el = findDOMNode(this) as HTMLElement;
      this.el.setAttribute("draggable", "true");
      this.el.addEventListener("dragstart", (e) => {
        e.preventDefault();
      });

      // IE 9
      this.el.addEventListener("selectstart", (e) => {
        e.preventDefault();
      });

      // subscribe to monitor
      const { monitor } = this.props;
      monitor.on(CallbackEvent.drag, this.onDrag);
      monitor.on(CallbackEvent.dragEnd, this.onDragEnd);
    }

    public componentWillUnmount() {
      // unsubscribe from monitor
      const { monitor } = this.props;
      monitor.off(CallbackEvent.drag, this.onDrag);
      monitor.off(CallbackEvent.dragEnd, this.onDragEnd);
    }

    public render() {
      const { monitor, ...props} = this.props as any;
      return (
        <WrappedComponent
          {...props}
          {...monitor.props.values}
          isDragged={this.state.isDragged}
        />
      )
    }
  }
)

export interface IDraggablePropTypes {
  onDrag: (props: IDraggableProps) => void
}

export const Draggable = draggable(
  class DraggableElement extends React.Component<IDraggableProps & IDraggablePropTypes> {
    public static defaultProps = {
      onDrag: () => {},
    }

    public componentDidUpdate(prevProps: IDraggableProps) {
      const {x, y, isDragged} = this.props;
      if (prevProps.x !== x ||
        prevProps.y !== y ||
        prevProps.isDragged !== isDragged
      ) {
        this.props.onDrag(this.props);
      }
    }

    public render() {
      return this.props.children;
    }
  },
)
