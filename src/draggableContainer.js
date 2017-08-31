import React from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';

import { attachEvents, detachEvents, isDrag, getEvent, getRectDeltas } from './utils';
import Monitor from './Monitor';

const draggableContainer = (WrappedComponent) => (
    class extends React.Component {

        static defaultProps = {
            onDragStart: function(monitor) {},
            onDragEnd: function(monitor) {}
        }

        static childContextTypes = {
          monitor: PropTypes.object.isRequired,
        }

        getChildContext() {
            const { monitor } = this;
            return { monitor };
        }

        constructor(props) {
            super(props);
            this.monitor = new Monitor(this);
        }
        
        events = {
            'mousemove': this.dragMove.bind(this),
            'touchmove': this.dragMove.bind(this),
            'mouseup': this.dragEnd.bind(this),
            'touchend': this.dragEnd.bind(this),
        }    

        droppables = []
        draggables = []

        componentDidMount() {
            this.el = findDOMNode(this);

            attachEvents(this.events, window);
        }

        componentWillUnmount() {
            detachEvents(this.events, window);
        }

        drag({clientX, clientY}) {
            requestAnimationFrame(() => {
                const { monitor } = this;

                if (monitor.dragged) {
                    const { container, initial, ghost } = monitor;

                    const containerRect = container.el.getBoundingClientRect();

                    //save client cursor positions but only inside container
                    monitor.cursorX = Math.max(containerRect.left, Math.min(containerRect.right, clientX));
                    monitor.cursorY = Math.max(containerRect.top, Math.min(containerRect.bottom, clientY));
                    
                    //calculate mouse deltas
                    const mouseDeltaX = clientX - initial.clientX;
                    const mouseDeltaY = clientY - initial.clientY;

                    //calculate new dragged position with respect to element scroll and document scroll
                    const containerDeltas = getRectDeltas(containerRect, initial.container.rect);
                    const scrollXDelta = container.el.scrollLeft - initial.container.scrollLeft;
                    const scrollYDelta = container.el.scrollTop - initial.container.scrollTop;
                    const x = mouseDeltaX + scrollXDelta - containerDeltas.left;
                    const y = mouseDeltaY + scrollYDelta - containerDeltas.top;

                    //fix dragged position to container
                    const draggedRect = (ghost ? ghost : initial.dragged.el).getBoundingClientRect();
                    const deltas = getRectDeltas(containerRect, draggedRect);
                    
                    monitor.x = Math.max(deltas.left + monitor.x + scrollXDelta, Math.min(deltas.right + monitor.x + scrollXDelta, x));
                    monitor.y = Math.max(deltas.top + monitor.y + scrollYDelta, Math.min(deltas.bottom + monitor.y + scrollYDelta, y));
                    
                    //save client cursor positions
                    monitor.clientX = clientX;
                    monitor.clientY = clientY;
    
                    //animate
                    monitor.doPositionDragged();
                    
                    //animate hover droppable
                    requestAnimationFrame(() => {
                        if (monitor.cursorX != null && monitor.cursorY != null) {
                            const target = document.elementFromPoint(monitor.cursorX, monitor.cursorY);
                
                            monitor.hovered = null;
                            this.droppables.forEach(c => {
                                c.hovered = c.el === target || c.el.contains(target);
                            });
                        }
                    });
                }
            })
        }
        
        dragMove(e) {
            if (!isDrag(e)) return;

            const { clientX, clientY } = getEvent(e);
            this.drag({ clientX, clientY });
        }

        dragEnd(e) {
            const { monitor } = this;
            
            const { dragged } = monitor;
            if (dragged) {
                dragged.drop();
                
                // reset droppables
                requestAnimationFrame(() => {
                    this.droppables.forEach(c => {
                        c.hovered = false
                    })
                });

                monitor.clean();
                this.props.onDragEnd();
            }
        }

        render() {
            return <WrappedComponent {...this.props} monitor={this.monitor}/>
        }
    }
);

export default draggableContainer;