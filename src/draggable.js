import React from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';

import { attachEvents, detachEvents, isDrag, getEvent } from './utils';

export const draggable = (WrappedComponent) => (
    class extends React.Component {
        
        static contextTypes = {
            monitor: PropTypes.object.isRequired
        }

        static childContextTypes = {
            draggable: PropTypes.object.isRequired,
        }
        
        static defaultProps = {
            onDrop: function(monitor) {
                if (monitor.hovered) {
                    alert(this.color);
                }
            }
        }

        getChildContext() {
            return { draggable: this };
        }

        state = {
            dragged: false
        }

        set dragged(value) {
            if (this.state.dragged !== value) {
                this.setState({dragged: value});
            }

            const { monitor } = this.context;
            if (monitor.dragged !== this) {
                monitor.dragged = value ? this : null;
            }
        }

        get dragged() {
            return this.state.dragged;
        }

        events = {
            'mousedown': this.dragStart.bind(this),
            'touchstart': this.dragStart.bind(this),
        }

        handles = []

        drop() {
            const { monitor } = this.context;
            const { styles } = monitor.initial.dragged;
            for (const style in styles) {
                this.el.style[style] = styles[style];
            }
            
            this.props.onDrop(monitor);
            this.dragged = false;
        }

        dragStart(e) {
            if (!isDrag(e)) return;
            
            const { monitor } = this.context;
            const { container } = monitor;
            const { clientX, clientY } = getEvent(e);
            
            const el = this.el;
            const { style } = el;
            const { transform, pointerEvents } = style;
            style.pointerEvents = 'none';

            monitor.initial = {
                clientX, clientY,
                container: {
                    scrollTop: container.el.scrollTop,
                    scrollLeft: container.el.scrollLeft,
                    rect: container.el.getBoundingClientRect()
                },
                dragged: {
                    styles: {
                        transform,
                        pointerEvents
                    },
                    rect: el.getBoundingClientRect(),
                    el
                }
            };

            this.dragged = true;
            container.props.onDragStart();
        }

        componentDidMount() {
            this.el = findDOMNode(this);
            this.context.monitor.container.draggables.push(this);

            if (!this.handles.length) {
                attachEvents(this.events, this.el);
                this.el.style.touchAction = 'none';
            }
        }

        componentWillUnmount() {
            if (!this.handles.length) {
                detachEvents(this.events, this.el);
            }
        }

        // optimization
        shouldComponentUpdate(props, state) {
            return props !== this.props || this.state.dragged !== state.dragged;
        }

        componentDidUpdate() {
            this.context.monitor.drawGhost();
        }

        render() {
            const { monitor } = this.context;
            const { dragged } = this.state;
            const props = { dragged, monitor };
            return <WrappedComponent {...this.props} {...props} />
        }
    }
)

export const draggableHandle = (WrappedComponent) => (
    class extends React.Component {
        static contextTypes = {
            monitor: PropTypes.object.isRequired,
            draggable: PropTypes.object.isRequired
        }

        componentDidMount() {
            this.el = findDOMNode(this);
            const { draggable } = this.context;
            draggable.handles.push(this);
            this.el.style.touchAction = 'none';

            attachEvents(draggable.events, this.el);
        }

        componentWillUnmount() {
            detachEvents(draggable.events, this.el);
        }

        render() {
            return <WrappedComponent {...this.props} />
        }
    }
)

export default { draggableHandle, draggable }