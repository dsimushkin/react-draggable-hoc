import * as React from "react";

import { DragDropContainer, Draggable, Droppable } from "react-draggable-hoc";

const initialValues = Array(20)
  .fill(undefined)
  .map((_, i) => i + 1);

export const SimpleExample = () => {
  const [dropped, changeDropped] = React.useState<number[]>([]);
  const values = React.useMemo(
    () => initialValues.filter((v) => dropped.indexOf(v) < 0),
    [dropped],
  );

  const onDrop: React.ComponentProps<typeof Droppable>["onDrop"] = ({
    dragProps,
  }) => {
    changeDropped([...dropped, dragProps as number]);
  };

  return (
    <DragDropContainer className="Simple-page-container">
      <div className="Simple-row scrollable">
        {values.map((i) => (
          <Draggable key={i} dragProps={i} className="Simple-cell">
            <div className="Cell-simple">
              <span className="Handle">::</span>
              <span>{i}</span>
            </div>
          </Draggable>
        ))}
      </div>
      <Droppable onDrop={onDrop}>
        {({ isHovered, ref, dragProps }) => (
          <div
            className="Simple-bin"
            ref={ref}
            style={{
              backgroundColor: isHovered ? "rgba(0, 130, 20, 0.2)" : undefined,
              border: dragProps ? "1px dashed #ccc" : undefined,
            }}
          >
            {values.length > 0
              ? dragProps
                ? "Drop it here"
                : "Start dragging"
              : "Congratulations, You Win!"}
            {values.length > 0 && (
              <div>Dropped values: [{dropped.join(", ")}]</div>
            )}
          </div>
        )}
      </Droppable>
    </DragDropContainer>
  );
};

export default () => (
  <React.Fragment>
    <p>
      Simple `Draggable` and And a single `Droppable` bin
      <br />
    </p>
    <SimpleExample />
  </React.Fragment>
);
