import * as React from 'react';
import { findDOMNode } from 'react-dom';
import {
  DragDropContainer,
  draggable,
  DraggableArea,
  DragMonitor,
  Droppable,
  IDraggableProps,
  IDroppableProps,
} from 'react-draggable-hoc';

const randomColor = () => {
  const randomPart = () => Math.floor(Math.random()*255);
  return 'rgb('+randomPart()+','+randomPart()+','+randomPart()+')';
}
  
// use a separate component to create a ghost
const ContentElement = ({ className="", children, style } : any) => (
  <span
    style={style}
    className={`Cell ${className}`}
  >
    {children}
  </span>
)
  
interface IContentProps {
  value: string,
  backgroundColor: string
}
  
const Content = draggable(
  class ContentWrapper extends React.Component<IDraggableProps & IContentProps> {
    public state = {
      color: undefined,
      isHovered: false
    }

    public onDrop = ({dragProps}: IDroppableProps) => {
      const state = {isHovered: false} as any;
      if (!this.props.isDragged && this.state.isHovered) {
        state.color = dragProps;
      }
      this.setState(state);
    }

    public onDrag = ({isHovered} : IDroppableProps) => {
      if (this.state.isHovered !== isHovered) {
        this.setState({isHovered});
      }
    }

    public isHovered = (component: React.Component<any>, { props: { x, initialPointer } }: DragMonitor) => {
      const nodeRect = (findDOMNode(component) as HTMLElement).getBoundingClientRect();
      return initialPointer != null && nodeRect.left <= initialPointer.pageX + x && nodeRect.right >= initialPointer.pageX + x;
    }

    public render() {
      const { x, isDragged, backgroundColor, value} = this.props;
      const { color, isHovered } = this.state;

      return (
        <Droppable
          onDrag={this.onDrag}
          onDrop={this.onDrop}
          isHovered={this.isHovered}
        >
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
              >
                <span>{value}</span>
              </ContentElement>
            )}
            {/* change text color when element is dragged */}
            <ContentElement
              value={value}
              style={{
                backgroundColor, color: isDragged ? 'red' : color
              }}
              className={isHovered ? 'hovered' : undefined}
            >
              <DraggableArea draggable={true}>
                <span>{value}</span>
              </DraggableArea>
            </ContentElement>
          </div>
        </Droppable>
      )
    }
  }
)


export const GhostExample = () => (
  <DragDropContainer>
    <div className="Ghost-container">
      {Array(20).fill(0).map((_, i) => {
        const color = randomColor();
        return (
          <Content
            backgroundColor={color}
            value={`Hello ${i}`}
            key={i}
            dragProps={color}
            delay={400}
            draggable={false}
          />
        )
      })}
    </div>
  </DragDropContainer>
)

export const GhostExampleTitle = () => (
  <p>
    Scrollable container, <br />
    draggable and droppable elements <br />
    with a ghost stuck to row bottom <br />
    custom hover implementation <br />
    drag handle <br />
    and a delay of 400ms
  </p>
)

export default () => (
  <React.Fragment>
    <GhostExampleTitle />
    <GhostExample />
  </React.Fragment>
)
