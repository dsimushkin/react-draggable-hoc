import * as React from "react";
import { DraggableMonitor } from "./Monitor";
import { DragEvent } from "./utils";

export interface IDraggableContainerContext {
  monitor: DraggableMonitor,
}

export type DraggableComponent = React.Component<any>;
export type DraggableContainerComponent = React.Component<any>;

export const DraggableContainerContext = React.createContext<IDraggableContainerContext>({
  monitor: new DraggableMonitor(undefined),
})

// TODO provide API for
// dragStart, dragEnd
export const draggableContainer = <T extends any>(
  WrappedComponent: React.ComponentType<T>,
) => (props: T) => (
  <DraggableContainer>
    <WrappedComponent {...props} />
  </DraggableContainer>
)

export class DraggableContainer extends React.Component<any> {
  private monitor = new DraggableMonitor(this);

  public onDragEnd = () => {
    this.monitor.dragEnd();
  }

  public onDrag = (event: Event) => {
    this.monitor.drag(event as DragEvent);
  }

  public componentDidMount() {
    window.addEventListener("mousemove", this.onDrag, true);
    window.addEventListener("mouseup", this.onDragEnd, true);
  }

  public componentWillUnmount() {
    window.removeEventListener("mousemove", this.onDrag, true);
    window.removeEventListener("mouseup", this.onDragEnd, true);
  }

  public render() {
    const { monitor } = this;
    return (
      <DraggableContainerContext.Provider value={{monitor}}>
        { this.props.children }
      </DraggableContainerContext.Provider>
    )
  }
}

export const withDraggable = <T extends any>(
  WrappedComponent: React.ComponentType<T & IDraggableContainerContext>,
) => (
  (props: T) => (
    <DraggableContainerContext.Consumer>
      {(draggableProps) => <WrappedComponent {...props} {...draggableProps} />}
    </DraggableContainerContext.Consumer>
  )
)
