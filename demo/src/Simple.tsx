import * as React from 'react';
import {
  DragDropContainer,
  draggable,
  Droppable,
  IDraggableProps,
  IDroppableProps,
} from 'react-draggable-hoc';

interface ISimpleDraggableProps {
    className?: any,
    style?: any,
    value: number,
}

/**
 * Simple React Component to render a draggable
 * @param param props
 */
export const SimpleDraggable = draggable((
  {value, x, y, isDragged, style={}, className} : ISimpleDraggableProps & IDraggableProps
) => (
  <div
    className={className}
    style={{
        ...style,
        transform: isDragged ? `translate3d(${x}px, ${y}px, -1px)` : undefined,
        transition: isDragged ? undefined : 'transform 1s'
    }}
  >
    <span>
      {value}
    </span>
  </div>
));

/**
 * Creates a Droppable container
 */
class DroppableWithState extends React.Component<{removeItem: (v: number) => any, canBeUsed: boolean}> {
  public state = {
    dragProps: null,
      dropped: [],
      isHovered: false,
  }

  public onDrop = ({dragProps} : IDroppableProps) => {
    this.setState({dropped: [...this.state.dropped, dragProps]});
    this.props.removeItem(dragProps);
  }

  public onDrag = (props : IDroppableProps) => {
    this.setState(props);
  }

  public render() {
    const {dragProps, dropped, isHovered,} = this.state;
    const {canBeUsed} = this.props;
    return (
      <Droppable
        onDrop={this.onDrop}
        onDrag={this.onDrag}
      >
        <div
          className="Simple-bin"
          style={{
            backgroundColor: isHovered ? 'rgba(0, 130, 20, 0.2)' : undefined,
            border: dragProps != null ? '1px dashed #ccc' : undefined,
          }}
        >
          {dragProps != null ? 'Drop it here' : (canBeUsed ? 'Start dragging' : 'Nothing to drag') } <br />
          {canBeUsed && dropped.length > 0 && (
            <p>
              Dropped values: [{dropped.join(', ')}]
            </p>
          )}
        </div>
      </Droppable>
    )
  }
}

export class SimpleExample extends React.Component {
  public state = {
    values: [1,2,3,4,5]
  }

  public removeItem = (v: number) => {
    this.setState({values: this.state.values.filter((val) => val !== v)});
  }
  
  public render() {
    return (
      <DragDropContainer>
        <div className="Simple-container">
            <div className="Simple-row">
              {/* value prop will be used by droppable */}
              {this.state.values.map((i) => (
                <SimpleDraggable
                  className="Cell-simple"
                  value={i}
                  key={i}
                  dragProps={i}
                />
              ))}
            </div>
            <DroppableWithState
              canBeUsed={this.state.values.length > 0}
              removeItem={this.removeItem}
            />
        </div>
      </DragDropContainer>
    )
  }
}

export const SimpleExampleTitle = () => (
  <p>
    Simple Draggable and Droppable<br />
  </p>
)
