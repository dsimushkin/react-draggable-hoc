import * as React from 'react';
import {
  draggable,
  DraggableContainer,
  Droppable,
  IDraggableProps,
  IDroppableProps,
} from 'react-draggable-hoc';

interface IDraggableElementProps {
    children?: any,
    className?: any,
    style?: any,
    value?: string,
}

/**
 * Simple React Component to render a draggable
 * @param param props
 */
export const DraggableElement = (
  {children, x, y, isDragged, style={}, className} : IDraggableElementProps & IDraggableProps
) => (
  <div
    className={className}
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
const SimpleDraggable = draggable(DraggableElement);

/**
 * Creates a Droppable container
 */
class DroppableWithState extends React.Component<IDroppableProps> {
  public state = {
      dragged: null,
      dropped: [],
      isHovered: false,
  }

  public onDrop = ({dragged} : IDroppableProps) => {
      if (dragged) {
          this.setState({dropped: [...this.state.dropped, dragged.props.value]});
      }
  }

  public onDrag = ({dragged, isHovered} : IDroppableProps) => {
      this.setState({isHovered, dragged});
  }

  public render() {
    const {dragged, isHovered} = this.state;
    const {dropped} = this.state;
    return (
      <Droppable
        onDrop={this.onDrop}
        onDrag={this.onDrag}
      >
        <div
          className="Simple-bin"
          style={{
            backgroundColor: isHovered ? 'rgba(0, 130, 20, 0.2)' : undefined,
            border: dragged ? '1px dashed #ccc' : undefined,
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

export const SimpleExample = () => (
  <DraggableContainer>
    <div className="Simple-container">
        <div className="Simple-row">
          {/* value prop will be used by droppable */}
          {Array(4).fill(undefined).map((_, i) => (
            <SimpleDraggable
              className="Cell-simple"
              value={`${i}`}
              key={i}
            >
              <span>{i}</span>
            </SimpleDraggable>
          ))}
        </div>
        <DroppableWithState />
    </div>
  </DraggableContainer>
)

export const SimpleExampleTitle = () => (
  <p>
    Simple Draggable and Droppable<br />
  </p>
)
