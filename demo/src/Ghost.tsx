import * as React from 'react';

import {
  DragDropContainer,
  Draggable,
  DraggableArea,
  Droppable,
  IDroppableProps,
} from 'react-draggable-hoc';

const randomColor = () => {
  const randomPart = () => Math.floor(Math.random()*255);
  return 'rgb('+randomPart()+','+randomPart()+','+randomPart()+')';
}

const DragHandle = ({color, draggable} : any) => (
  <DraggableArea draggable={draggable}>
    {({node}) => (
      <div className="handle" ref={node}>
        <div className="bar" style={{backgroundColor: color}} />
        <div className="bar" style={{backgroundColor: color}} />
        <div className="bar" style={{backgroundColor: color}} />
      </div>
    )}
  </DraggableArea>
)
  
// use a separate component to create a ghost
const ContentElement = ({ className="", children, draggable = false, style } : any) => (
  <span
      style={style}
      className={`Cell ${className}`}
  >
    <DragHandle
      draggable={draggable}
      color={style.color}
    />
    {children}
  </span>
)
  
interface IContentProps {
  value: string,
  backgroundColor: string
}
  
class Content extends React.Component<IContentProps> {
  public state = {
    color: undefined,
    isDragged: false
  }

  public onDrop = ({dragProps}: IDroppableProps) => {
    const state = {isHovered: false} as any;
    if (!this.state.isDragged && dragProps.isHovered) {
      state.color = dragProps;
    }
    this.setState(state);
  }

  // public isHoveredFactory = (component: React.Component<any>, { props: { x, initialPointer } }: DragMonitor) => {
  //   const nodeRect = (findDOMNode(component) as HTMLElement).getBoundingClientRect();
  //   return initialPointer != null && nodeRect.left <= initialPointer.pageX + x && nodeRect.right >= initialPointer.pageX + x;
  // }

  public render() {
    const { backgroundColor, value} = this.props;
    const { color } = this.state;

    return (
      <Draggable
        delay={400}
        draggable={false}
      >
        {({x, isDragged}) => (
          <Droppable
            onDrop={this.onDrop}
            // isHovered={this.isHoveredFactory}
          >
            {({isHovered}) => (
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
                  draggable={true}
                >
                  <span>{value}</span>
                </ContentElement>
              </div>
            )}
          </Droppable>
        )}
      </Draggable>
    )
  }
}


export const GhostExample = () => (
  // <DragDropContainer>
    <div className="Ghost-container">
      {Array(20).fill(0).map((_, i) => {
        const color = randomColor();
        return (
          <Content
            backgroundColor={color}
            value={`Hello ${i}`}
            key={i}
          />
        )
      })}
    </div>
  // </DragDropContainer>
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
