import React from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';

const droppable = (WrappedComponent) => (
    class extends React.Component {
        static contextTypes = {
            monitor: PropTypes.object.isRequired
        }

        state = {
            hovered: false
        }

        set hovered(value) {
            if (this.state.hovered !== value) {
                this.setState({hovered: value});
            }

            const { monitor } = this.context;
            if (monitor.hovered !== this) {
                monitor.hovered = value ? this : null;
            }
        }

        get hovered() {
            return this.state.hovered;
        }

        // optimization
        shouldComponentUpdate(props, state) {
            return props !== this.props || this.state.hovered !== state.hovered;
        }

        componentDidMount() {
            this.el = findDOMNode(this);
            this.context.monitor.container.droppables.push(this);
        }

        render() {
            const { hovered } = this.state;
            const { monitor } = this.context;
            const props = { hovered, monitor };

            return <WrappedComponent {...this.props} {...props} />
        }
    }
)

export default droppable;