import * as React from "react";
import { findDOMNode } from "react-dom";
import { IDraggable, IDraggableContainerContext, withDragDropContainerContext } from "./DragDropContainer";
import { IDragProps } from "./DraggableProperties";
import { DragActions } from "./Monitor";
import * as utils from "./utils";

export interface IDraggableProps extends IDragProps {
  isDragged?: boolean,
}

export const draggable = <T extends any>(
  WrappedComponent: React.ComponentType<T & IDraggableProps>,
) => (
  class DraggableWrapper extends React.Component<T & IDraggablePropTypes> {
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
      const { delay, dragProps, draggable: draggableP, disabled, ...props} = this.props as any;
      return (
        <Draggable
          onDrag={this.onDrag}
          onDragEnd={this.onDragEnd}
          onDragStart={this.onDragStart}
          delay={delay}
          dragProps={dragProps}
          draggable={draggableP}
          disabled={disabled}
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
  delay?: number,
  disabled?: boolean,
  draggable?: boolean,
  onDrag?: (props: IDraggableProps) => void,
  onDragStart?: (props: IDraggableProps) => void,
  onDragEnd?: (props: IDraggableProps) => void,
}

export interface IDraggableContext {
  subscribe: (component: IDraggableArea) => void,
  unsubscribe: (component: IDraggableArea) => void,
}

const DraggableContext = React.createContext<IDraggableContext>({
  subscribe: () => {},
  unsubscribe: () => {},
});

export interface IDraggableArea {
  el: ReturnType<typeof findDOMNode>,
  draggable: boolean,
  self: React.Component<any>
}

export const Draggable = withDragDropContainerContext(
  class DraggableElement extends React.Component<
    IDraggablePropTypes & {children: React.ReactNode} & IDraggableContainerContext
  > {
    public static defaultProps = {
      delay: 0,
      disabled: false,
      draggable: true,
      onDrag: () => {},
      onDragEnd: () => {},
      onDragStart: () => {},
    }
    public isDragged = false;
    public dragAreas: IDraggableArea[] = [];

    get draggableProps() {
      return {...this.props.monitor.props.values, isDragged: this.isDragged};
    }

    public onDragStart = async (event: Event) => {
      if (this.props.disabled) {
        this.props.monitor.dragEnd();
        return;
      }

      const {target} = event;
      if (target && utils.isDragStart(event as utils.DragEvent)) {
        // define draggable area
        const area = this.dragAreas
          .filter(({el}) => el != null && el.contains(target as Node))
          .reduce(
            (prev: IDraggableArea | undefined, next) => !prev || prev.el!.contains(next.el) ? next : prev,
            undefined,
          );

        const isDrag = area && area.draggable;

        if (isDrag) {
          if (event.type === "mousedown") {
            utils.preventDefault(event);
          }
          try {
            this.isDragged = await this.props.monitor.dragStart(this, event as utils.DragEvent, this.props.delay);
            this.props.onDragStart!(this.draggableProps)
          } catch (e) {
            this.isDragged = false;
          }
        }
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
      this.setDraggable(this, this.onDragStart);

      const { monitor } = this.props;
      monitor.on(DragActions.drag, this.onDrag);
      monitor.on(DragActions.dragEnd, this.onDragEnd);
    }

    public setDraggable = (component: React.ReactInstance, listener: (event: Event) => void) => {
      const el = findDOMNode(component) as HTMLElement;
      el.addEventListener("mousedown", listener, true);
      el.addEventListener("touchstart", listener, true);
    }

    public subscribe = (dragArea: IDraggableArea) => {
      if (!this.dragAreas.some((v) => v.self === dragArea.self)) {
        this.dragAreas.push(dragArea);
      }
    }

    public unsubscribe = (dragArea: IDraggableArea) => {
      this.dragAreas = this.dragAreas.filter((v) => v.self !== dragArea.self);
    }

    public componentWillUnmount() {
      const { monitor } = this.props;
      monitor.off(DragActions.drag, this.onDrag);
      monitor.off(DragActions.dragEnd, this.onDragEnd);
    }

    public render() {
      const {subscribe, unsubscribe} = this;
      return (
        <DraggableContext.Provider value={{subscribe, unsubscribe}}>
          <DraggableArea draggable={this.props.draggable!}>
            {this.props.children}
          </DraggableArea>
        </DraggableContext.Provider>
      )
    }
  },
)

export const withDraggable = <T extends any>(
  WrappedComponent: React.ComponentType<T & IDraggableContext>,
) => (
  (props: T) => (
    <DraggableContext.Consumer>
      {(draggableContext) => <WrappedComponent {...props} {...draggableContext} />}
    </DraggableContext.Consumer>
  )
)

export interface IDraggableAreaProps {
  draggable: boolean,
  children: React.ReactNode,
}

export const DraggableArea = withDraggable(
  class DraggableAreaElement extends React.PureComponent<IDraggableAreaProps & IDraggableContext> {
    get draggableArea() {
      const self = this;
      return {
        get el() {
          return findDOMNode(self)
        },
        get self() {
          return self;
        },
        draggable: this.props.draggable,
      };
    }

    public componentDidMount() {
      this.props.subscribe(this.draggableArea);
    }

    public componentWillUpdate() {
      this.props.subscribe(this.draggableArea);
    }

    public componentWillUnmount() {
      this.props.unsubscribe(this.draggableArea);
    }

    public render() {
      return this.props.children;
    }
  },
)
