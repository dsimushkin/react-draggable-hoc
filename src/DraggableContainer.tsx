import * as React from "react";
import { DragMonitor } from "./Monitor";
import { DragEvent } from "./utils";

export interface IDraggableContainerContext {
  monitor: DragMonitor,
}

export interface IDraggable {
  dragProps: any
}

export type DraggableComponent = React.Component<IDraggable>;
export type DraggableContainerComponent = React.Component<any>;

const ContainerContext = React.createContext<IDraggableContainerContext>({
  monitor: new DragMonitor(),
})

export class DragDropContainer extends React.Component<{children: React.ReactNode}> {
  private monitor = new DragMonitor(this);

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
      <ContainerContext.Provider value={{monitor}}>
        { this.props.children }
      </ContainerContext.Provider>
    )
  }
}

export const withDragDropContainerContext = <T extends any>(
  WrappedComponent: React.ComponentType<T & IDraggableContainerContext>,
) => (
  (props: T) => (
    <ContainerContext.Consumer>
      {(draggableProps) => <WrappedComponent {...props} {...draggableProps} />}
    </ContainerContext.Consumer>
  )
)
