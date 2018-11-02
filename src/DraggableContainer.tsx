import * as React from 'react';
import { DraggableMonitor } from './Monitor';
import { DragEvent } from './utils';

export type Omit<T, K> = Pick<T, Exclude<keyof T, keyof K>>;

export interface IDraggableContext {
    monitor: DraggableMonitor,
}

export interface IDraggableProps {
    isDragged?: boolean,
    x?: number,
    y?: number
}

export interface IDroppableProps {
    dragged?: DraggableComponent,
    isDropped?: boolean,
    isHovered?: boolean,
}

export type DraggableComponent = React.Component<any>;
export type DraggableContainerComponent = React.Component<any>;

export const DraggableContext = React.createContext<IDraggableContext>({
    monitor: new DraggableMonitor(undefined),
})

// TODO provide API for
// dragStart, dragEnd
export const draggableContainer = <T extends any>(WrappedComponent : React.ComponentType<T>) => (props: T) => (
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
        window.addEventListener('mousemove', this.onDrag, true);
        window.addEventListener('mouseup', this.onDragEnd, true);
    }

    public componentWillUnmount() {
        window.removeEventListener('mousemove', this.onDrag, true);
        window.removeEventListener('mouseup', this.onDragEnd, true);
    }

    public render() {
        const { monitor } = this;
        return (
            <DraggableContext.Provider value={{monitor}}>
                { React.Children.only(this.props.children) }
            </DraggableContext.Provider>
        )
    }
}

export const withDraggable = <T extends any>(WrappedComponent: React.ComponentType<T & IDraggableContext>) => {
    return (props: Omit<T, IDraggableContext>) => (
        <DraggableContext.Consumer>
            {(draggableProps) => <WrappedComponent {...props} {...draggableProps} />}
        </DraggableContext.Consumer>
    )
}
