import * as React from 'react';
import {
  DragDropContainer,
  draggable,
  Droppable,
  IDroppableProps,
} from 'react-draggable-hoc';

/**
 * Simple React Component to render a draggable
 * @param param props
 */
export const SimpleDraggable = draggable(({
    value, x, y, isDragged, style={}, className
}) => (
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
class DroppableWithState extends React.Component {
  state = {
    dragProps: undefined,
    dropped: [],
    isHovered: false,
  }

  onDrop = ({dragProps}) => {
    this.setState({dropped: [...this.state.dropped, dragProps]});
    this.props.removeItem(dragProps);
  }

  onDrag = (props) => {
    this.setState(props);
  }

  render() {
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
  state = {
    values: [1,2,3,4,5]
  }

  removeItem = (v) => {
    this.setState({values: this.state.values.filter((val) => val !== v)});
  }
  
  render() {
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

export default () => (
  <React.Fragment>
    <SimpleExampleTitle />
    <SimpleExample />
  </React.Fragment>
)
