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
class DroppableWithState extends React.Component<{removeItem: (v: number) => any}> {
  public state = {
    dragProps: null,
      dropped: [],
      isHovered: false,
  }

  public onDrop = ({dragProps} : IDroppableProps) => {
    const state = {isHovered: false, dragged: null} as any;
    if (dragProps != null) {
      state.dropped = [...this.state.dropped, dragProps];
      this.props.removeItem(dragProps);
    }
    this.setState(state);
  }

  public onDrag = (props : IDroppableProps) => {
      this.setState(props);
  }

  public render() {
    const {dragProps, dropped, isHovered,} = this.state;
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
          {dragProps != null ? 'Drop it here' : 'Start dragging' } <br />
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

export class SimpleExample extends React.Component {
  public state = {
    values: [1,2,3,4,5]
  }
  public removeItem = (v: number) => {
    this.setState({values: this.state.values.filter((val) => val !== v)});
  }
  public render() {
    return (
      <DraggableContainer>
        <div className="Simple-container">
            <div className="Simple-row">
              {/* value prop will be used by droppable */}
              {this.state.values.map((i) => (
                <SimpleDraggable
                  className="Cell-simple"
                  value={`${i}`}
                  key={i}
                  dragProps={i}
                >
                  <span>{i}</span>
                </SimpleDraggable>
              ))}
            </div>
            <DroppableWithState removeItem={this.removeItem}/>
        </div>
      </DraggableContainer>
    )
  }
}

export const SimpleExampleTitle = () => (
  <p>
    Simple Draggable and Droppable<br />
  </p>
)
