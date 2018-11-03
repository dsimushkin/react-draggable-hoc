import * as React from 'react';
import { findDOMNode } from 'react-dom';
import {
  draggable,
  draggableContainer,
  DraggableMonitor,
  droppable,
  IDraggableProps,
  IDroppableProps
} from 'react-draggable-hoc';

const randomColor = () => {
    const randomPart = () => Math.floor(Math.random()*255);
    return 'rgb('+randomPart()+','+randomPart()+','+randomPart()+')';
}
  
// use a separate component to create a ghost
const ContentElement = ({ className="", value, style } : any) => (
    <span
      style={style}
      className={`Cell ${className}`}
    >
      {value}
    </span>
)
  
interface IContentProps {
    value: string,
    backgroundColor: string
}
  
const Content = droppable(draggable(
    class extends React.Component<IDraggableProps & IDroppableProps & IContentProps> {
      public state = {
        color: 'initial'
      }
      
      public componentDidUpdate(prevProps: IDraggableProps & IDroppableProps) {
        if (this.props.isDropped &&
            !prevProps.isDropped &&
            !this.props.isDragged &&
            this.props.dragged
        ) {
          this.setState({color: this.props.dragged.props.backgroundColor})
        }
      }
  
      public render() {
        const { x, isDragged, isHovered, backgroundColor, value} = this.props;
        const { color } = this.state;
  
        return (
          <div style={{display: 'inline-block', textAlign: 'left', position: 'relative'}}>
            {/* create a ghost and position it on drag */}
            {isDragged && (
              <ContentElement
                value={value}
                style={{
                  backgroundColor,
                  color,
                  position: 'absolute',
                  transform: `translate3d(${x}px, 100%, -1px)`,
                  zIndex: 1,
                }}
              />
            )}
            {/* change text color when element is dragged */}
            <ContentElement
              value={value}
              style={{
                backgroundColor, color: isDragged ? 'red' : color
              }}
              className={isHovered ? 'hovered' : undefined}
            />
          </div>
        )
      }
    }
), (component: React.Component<any>, { props: { x, initialEvent } }: DraggableMonitor) => {
    const nodeRect = (findDOMNode(component) as HTMLElement).getBoundingClientRect();
    return initialEvent != null && nodeRect.left <= initialEvent.pageX + x && nodeRect.right >= initialEvent.pageX + x;
})

export const GhostExample = draggableContainer(() => (
    <div className="Ghost-container">
      {Array(20).fill(0).map((_, i) => (
        <Content backgroundColor={randomColor()} value={`Hello ${i}`} key={i}/>
      ))}
    </div>
))

export const GhostExampleTitle = () => (
  <p>
    Scrollable container, <br />
    draggable and droppable elements <br />
    with a ghost stuck to row bottom <br />
    and effects on drag over and drag start
  </p>
)
