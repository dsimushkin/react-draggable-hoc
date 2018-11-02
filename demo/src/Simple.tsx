import * as React from 'react';
import {
    draggable,
    DraggableContainer,
    droppable,
    IDraggableProps,
    IDroppableProps,
} from 'react-draggable-hoc';

const Draggable = draggable(({value, x, y, isDragged} : {value: string} & IDraggableProps) => (
    <div
        className="Cell-simple"
        style={{
            transform: isDragged ? `translate3d(${x}px, ${y}px, -1px)` : undefined,
            transition: isDragged ? undefined : 'transform 1s'
        }}
    >
        {value}
    </div>
));

const Droppable = droppable(
    class extends React.Component<IDroppableProps> {
        public state = {
            dropped: []
        }

        public componentDidUpdate(prevProps: IDroppableProps) {
            if (this.props.isDropped &&
                !prevProps.isDropped &&
                this.props.dragged
            ) {
              this.setState({dropped: [...this.state.dropped, this.props.dragged.props.value]})
            }
        }

        public render() {
            const {dragged, isHovered} = this.props;
            const {dropped} = this.state;
            return (
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
            )
        }
    }
)

export const SimpleExample = () => (
    <DraggableContainer>
        <div className="Simple-container">
            <div className="Simple-row">
                {Array(5).fill(undefined).map((_, i) => (
                    <Draggable
                        key={i}
                        value={`${i}`}
                    />
                ))}
            </div>
            <Droppable />
        </div>
    </DraggableContainer>
)
