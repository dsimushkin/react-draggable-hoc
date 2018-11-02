import * as React from 'react';
import { findDOMNode } from 'react-dom';
import { IDraggableContext, IDraggableProps, withDraggable } from './DraggableContainer';
import { CallbackEvent, DraggableMonitor } from './Monitor';
import { DragEvent, isDrag } from './utils';

export const draggable = <T extends any>(WrappedComponent : React.ComponentType<T>) => (
    withDraggable(draggableWrapper(WrappedComponent))
)

const draggableWrapper = <T extends any>(WrappedComponent: React.ComponentType<T>) => (
    class extends React.Component<T & IDraggableProps & IDraggableContext> {
        public el?: HTMLElement;
        
        public state = {
            isDragged: false,
        }

        public onDragStart = (event: Event) => {
            if (isDrag(event as DragEvent) && this.el!.contains(event.target as HTMLElement)) {
                this.props.monitor.dragStart(this, event);
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
            this.el.addEventListener('mousedown', this.onDragStart, true);

            // TODO move to draggable Handle
            // prevent pointer interactions
            this.el = findDOMNode(this) as HTMLElement;
            this.el.setAttribute('draggable', 'true');
            this.el.addEventListener('dragstart', (e) => {
                e.preventDefault();
            });

            // IE 9
            this.el.addEventListener('selectstart', (e) => {
                e.preventDefault();
            });

            const { monitor } = this.props;
            monitor.on(CallbackEvent.drag, this.onDrag);
            monitor.on(CallbackEvent.dragEnd, this.onDragEnd);
        }

        public componentWillUnmount() {
            const { monitor } = this.props;
            monitor.off(CallbackEvent.drag, this.onDrag);
            monitor.off(CallbackEvent.dragEnd, this.onDragEnd);
        }

        public render() {
            const { monitor, ...props } = this.props as any;
            const { props: draggedProps } = this.props.monitor as DraggableMonitor;
            return (
                <WrappedComponent
                    {...props}
                    {...draggedProps}
                    x={draggedProps.x}
                    y={draggedProps.y}
                    isDragged={this.state.isDragged}
                />
            )
        }
    }
)