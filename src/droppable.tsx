import * as React from 'react';
import { findDOMNode } from 'react-dom';
import { IDraggableContext, IDroppableProps, withDraggable } from './DraggableContainer';
import { CallbackEvent, DraggableMonitor } from './Monitor';

const containsPoint = (component: React.Component<any>, { x, y }: { x: number, y: number }) => {
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

export const droppable = <T extends any>(WrappedComponent : React.ComponentType<T>, isHovered?: (component: React.Component<any>, monitor: DraggableMonitor) => boolean) => (
    withDraggable(droppableWrapper(WrappedComponent, isHovered))
)

const droppableWrapper = <T extends any>(WrappedComponent: React.ComponentType<T>, isHovered?: (component: React.Component<any>, monitor: DraggableMonitor) => boolean) => (
    class extends React.Component<T & IDroppableProps & IDraggableContext> {
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
            monitor.on(CallbackEvent.dragStart, this.onDragStart);
            monitor.on(CallbackEvent.drag, this.onDrag);
            monitor.on(CallbackEvent.beforeDragEnd, this.onDrop);
            monitor.on(CallbackEvent.dragEnd, this.onDragEnd);
        }

        public componentWillUnmount() {
            const { monitor } = this.props;
            monitor.off(CallbackEvent.dragStart, this.onDragStart);
            monitor.off(CallbackEvent.drag, this.onDrag);
            monitor.off(CallbackEvent.beforeDragEnd, this.onDrop);
            monitor.off(CallbackEvent.dragEnd, this.onDragEnd);
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
    class Droppable extends React.Component<IDroppableProps & IDroppablePropTypes> {
        static defaultProps = {
            onDrag: () => {},
            onDrop: () => {}
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
    }
) as React.ComponentType<IDroppablePropTypes & any>

