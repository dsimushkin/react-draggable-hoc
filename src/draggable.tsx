import * as React from "react";
import { findDOMNode } from "react-dom";
import { IDraggable, IDraggableContainerContext, withDraggableContainer } from "./DraggableContainer";
import { IDragProps } from "./DraggableProperties";
import { DragActions } from "./Monitor";
import { DragEvent, isDrag } from "./utils";

export interface IDraggableProps extends IDragProps {
  isDragged?: boolean,
}

export const draggable = <T extends any>(
  WrappedComponent: React.ComponentType<T & IDraggableProps>,
) => (
  class DraggableWrapper extends React.Component<T & IDraggable> {
    public state = {
      isDragged: false,
      values: {},
    }

    public onDragStart = (values: IDraggableProps) => {
      this.setState({isDragged: true, values});
    }

    public onDrag = (values: IDraggableProps) => {
      this.setState({values});
    }

    public onDragEnd = (values: IDraggableProps) => {
      this.setState({isDragged: false, values});
    }

    public render() {
      const { dragProps, ...props} = this.props as any;
      return (
        <Draggable
          onDrag={this.onDrag}
          onDragEnd={this.onDragEnd}
          onDragStart={this.onDragStart}
          dragProps={dragProps}
        >
          <WrappedComponent
            {...props}
            {...this.state.values}
            isDragged={this.state.isDragged}
          />
        </Draggable>
      )
    }
  }
)

export interface IDraggablePropTypes extends IDraggable {
  onDrag?: (props: IDraggableProps) => void,
  onDragStart?: (props: IDraggableProps) => void,
  onDragEnd?: (props: IDraggableProps) => void,
  children: React.ReactNode,
}

export const Draggable = withDraggableContainer(
  class DraggableElement extends React.Component<IDraggablePropTypes & IDraggableContainerContext> {
    public static defaultProps = {
      onDrag: () => {},
      onDragEnd: () => {},
      onDragStart: () => {},
    }
    public el?: HTMLElement;
    public isDragged = false;

    get draggableProps() {
      return {...this.props.monitor.props.values, isDragged: this.isDragged};
    }

    public onDragStart = (event: Event) => {
      if (isDrag(event as DragEvent) && this.el!.contains(event.target as HTMLElement)) {
        this.isDragged = true;
        this.props.monitor.dragStart(this, event as DragEvent);
        this.props.onDragStart!(this.draggableProps)
      }
    }

    public onDrag = () => {
      if (this.isDragged) {
        this.props.onDrag!(this.draggableProps);
      }
    }

    public onDragEnd = () => {
      if (this.isDragged) {
        this.isDragged = false;
        this.props.onDragEnd!(this.draggableProps);
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
      monitor.on(DragActions.drag, this.onDrag);
      monitor.on(DragActions.dragEnd, this.onDragEnd);
    }

    public componentWillUnmount() {
      // unsubscribe from monitor
      const { monitor } = this.props;
      monitor.off(DragActions.drag, this.onDrag);
      monitor.off(DragActions.dragEnd, this.onDragEnd);
    }

    public render() {
      return this.props.children;
    }
  },
)
