import * as React from "react";

import { DragDropContainer, Draggable, Droppable } from "react-draggable-hoc";

const initialValues = Array(400)
  .fill(undefined)
  .map((_, i) => i + 1);

export const SimpleExample = () => {
  const [dropped, changeDropped] = React.useState<number[]>([]);
  const values = React.useMemo(
    () => initialValues.filter(v => dropped.indexOf(v) < 0),
    [dropped]
  );

  const onDrop = (dragProps: number) => {
    changeDropped([...dropped, dragProps]);
  };

  return (
    <DragDropContainer className="Simple-container">
      <div className="scrollable">
        <div className="Simple-row">
          {values.map(i => (
            <Draggable key={i} dragProps={i} className="Cell-simple">
              <span>{i}</span>
            </Draggable>
          ))}
        </div>
      </div>
      <Droppable onDrop={onDrop}>
        {({ isHovered, nodeRef, dragProps }) => (
          <div
            className="Simple-bin"
            ref={nodeRef}
            style={{
              backgroundColor: isHovered ? "rgba(0, 130, 20, 0.2)" : undefined,
              border: dragProps ? "1px dashed #ccc" : undefined
            }}
          >
            {values.length > 0
              ? dragProps
                ? "Drop it here"
                : "Start dragging"
              : "Nothing to drag"}
            <div>Dropped values: [{dropped.join(", ")}]</div>
          </div>
        )}
      </Droppable>
    </DragDropContainer>
  );
};

export default () => (
  <React.Fragment>
    <p>
      Simple Draggable and Droppable
      <br />
    </p>
    <SimpleExample />
  </React.Fragment>
);
