import * as React from "react";

import {
  DragDropContainer,
  Draggable,
  Droppable,
} from "react-draggable-hoc";

interface ISimpleExampleState {
  dropped: number[],
  values: number[],
  dragged?: number,
  x?: number,
  y?: number
}

export class SimpleExample extends React.Component<any, ISimpleExampleState> {
  public c?: HTMLDivElement;

  public state = {
    dropped: [],
    values: [1,2,3,4,5],
  }
  
  public render() {
    return (
      <DragDropContainer>
        {({node: ref, x, y, isDragged}) => (
            <div
              className="Simple-container"
              ref={ref}
            >
              <div className="Simple-row">
                {this.state.values.map((i) => (
                  <Draggable
                    key={i}
                    dragProps={i}
                  >
                    {({isDragged: dragged, node}) => {
                      return (
                        <div
                          ref={node}
                          className="Cell-simple"
                          style={{
                              transform: dragged ? `translate3d(${x}px, ${y}px, -1px)` : undefined,
                              transition: dragged ? undefined : 'transform 1s'
                          }}
                        >
                          <span>{i}</span>
                        </div>
                      )
                    }}
                  </Draggable>
                ))}
              </div>
              <Droppable>
                {({isHovered, dragProps}) => (
                  <div
                    className="Simple-bin"
                    style={{
                      backgroundColor: isHovered ? 'rgba(0, 130, 20, 0.2)' : undefined,
                      border: isDragged ? '1px dashed #ccc' : undefined,
                    }}
                  >
                    {this.state.values.length > 0 ? (
                      isDragged ? (
                        'Drop it here'
                      ) : (
                        'Start dragging'
                      )
                    ) : (
                        'Nothing to drag'
                    )}
                    <p>
                      Dropped values: [{this.state.dropped.join(', ')}]
                    </p>
                  </div>
                )}
              </Droppable>
            </div>
        )}
      </DragDropContainer>
    )
  }
}

export default () => (
  <React.Fragment>
    <p>
      Simple Draggable and Droppable<br />
    </p>
    <SimpleExample />
  </React.Fragment>
)
