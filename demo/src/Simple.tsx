import * as React from 'react';
import {
    draggable,
    Draggable,
    DraggableContainer,
    droppable,
    Droppable,
    IDraggableProps,
    IDroppableProps,
} from 'react-draggable-hoc';

/**
 * Simple React Component to render a draggable
 * @param param props
 */
const SimpleComponent = ({children, x, y, isDragged, style={}} : {children?: any, value?: string, style?: any} & IDraggableProps) => (
    <div
        className="Cell-simple"
        style={{
            ...style,
            transform: isDragged ? `translate3d(${x}px, ${y}px, -1px)` : undefined,
            transition: isDragged ? undefined : 'transform 1s'
        }}
    >
        {children}
    </div>
);

/**
 * draggable by any point
 */
const SimpleDraggable = draggable(SimpleComponent);

/**
 * draggable by handle (value)
 */
class DraggableWithState extends React.Component<any> {
    public state = {
        isDragged: false,
        x: 0,
        y: 0,
    }

    public onDrag = ({x=0, y=0, isDragged=false} : IDraggableProps) => {
        this.setState({isDragged, x, y});
    }

    public render() {
        // value prop will be used by droppable
        return (
            <Draggable
                onDrag={this.onDrag}
                value={this.props.value}
            >
                <SimpleComponent {...this.state}>
                    <span>{this.props.value}</span>
                </SimpleComponent>
            </Draggable>
        )
    }
}

/**
 * Creates a Droppable container
 * 
 * we use droppable HOC to inject props, 
 * we can remove this method usage, adding this.onDrag as Droppable onDrag prop
 * we use Droppable to have onDrop method,
 * otherwise we would have to use only props inject with droppable HOC
 */
const DroppableWithValues = droppable(
    class DroppableWithState extends React.Component<IDroppableProps> {
        public state = {
            // dragged: null,
            dropped: [],
            // isHovered: false,
        }

        public onDrop = ({dragged} : IDroppableProps) => {
            if (dragged) {
                this.setState({dropped: [...this.state.dropped, dragged.props.value]});
            }
        }

        /**
         * set this as Droppable onDrag prop,
         * remove droppable HOC around class
         * and change render method to use state instead of props
         */
        public onDrag = ({dragged, isHovered} : IDroppableProps) => {
            this.setState({isHovered, dragged});
        }

        public render() {
            // we use props because of droppable HOC
            const {dragged, isHovered} = this.props;
            const {dropped} = this.state;
            return (
                <Droppable
                    onDrop={this.onDrop}
                >
                    <div
                        style={{
                            alignItems: 'center',
                            backgroundColor: isHovered ? 'rgba(0, 130, 20, 0.2)' : undefined,
                            border: dragged ? '1px dashed #ccc' : undefined,
                            borderRadius: 4,
                            display: 'grid',
                            margin: 10,
                            minHeight: 50,
                        }}
                    >
                        {dragged ? 'Drop it here' : 'Start dragging' } <br />
                        {dropped.length > 0 && (
                            <p>
                                Dropped values: [{dropped.join(', ')}]
                            </p>
                        )}
                    </div>
                </Droppable>
            )
        }
    }
)

export const SimpleExample = () => (
    <DraggableContainer>
        <div className="Simple-container">
            <div className="Simple-row">
                {Array(3).fill(undefined).map((_, i) => (
                    <DraggableWithState
                        key={i}
                        value={`${i}`}
                    />
                ))}
                {/* value prop will be used by droppable */}
                <SimpleDraggable
                    value="4"
                    style={{cursor: 'move'}}
                >
                    <span>4</span>
                </SimpleDraggable>
            </div>
            <DroppableWithValues />
        </div>
    </DraggableContainer>
)

export const SimpleExampleTitle = () => (
    <p>
      Simple Draggable and Droppable<br />
    </p>
)
