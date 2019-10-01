import * as React from "react";

import {
  DragDropContainer,
  Draggable,
  Droppable,
  checkTargets
} from "react-draggable-hoc";

const randomColor = () => {
  const randomPart = () => Math.floor(Math.random() * 255);
  return "rgb(" + randomPart() + "," + randomPart() + "," + randomPart() + ")";
};

// use a separate component to create a ghost
const ContentElement = ({
  className = "",
  style,
  handleRef,
  value,
  nodeRef
}: any) => (
  <span style={style} className={`Cell ${className}`} ref={nodeRef}>
    <div className="handle" ref={handleRef}>
      <div className="bar" style={{ backgroundColor: style.color }} />
      <div className="bar" style={{ backgroundColor: style.color }} />
      <div className="bar" style={{ backgroundColor: style.color }} />
    </div>
    <span>{value}</span>
  </span>
);

interface IContentProps {
  value: string;
  backgroundColor: string;
}

const Content = ({ backgroundColor, value }: IContentProps) => {
  const [color, changeColor] = React.useState();

  const onDrop = (dragProps: string) => {
    changeColor(dragProps);
  };

  return (
    <Draggable delay={400} dragProps={backgroundColor}>
      {({ x, isDragged, nodeRef, dragHandleRef }) => (
        <Droppable
          onDrop={onDrop}
          method={(nodeRef, dragStats) => {
            if (!checkTargets(nodeRef, dragStats)) {
              return false;
            }

            const a = nodeRef.current.getBoundingClientRect();
            const { x } = dragStats.current!;

            return a.left <= x && a.right >= x;
          }}
        >
          {({ isHovered, nodeRef: dropNodeRef }) => (
            <div
              style={{
                display: "inline-block",
                textAlign: "left",
                position: "relative"
              }}
              ref={dropNodeRef}
            >
              {/* create a ghost and position it on drag */}
              <ContentElement
                value={value}
                style={{
                  backgroundColor,
                  color,
                  position: "absolute",
                  transform: `translate3d(${x}px, 100%, -1px)`,
                  visibility: !isDragged ? "hidden" : undefined,
                  zIndex: isDragged ? 1 : -1
                }}
                nodeRef={nodeRef}
              />
              {/* change text color when element is dragged */}
              <ContentElement
                value={value}
                style={{
                  backgroundColor,
                  color: isDragged ? "red" : color
                }}
                className={isHovered ? "hovered" : undefined}
                handleRef={dragHandleRef}
              />
            </div>
          )}
        </Droppable>
      )}
    </Draggable>
  );
};

export const GhostExample = () => (
  <DragDropContainer className="Ghost-container">
    {Array(20)
      .fill(0)
      .map((_, i) => {
        const color = randomColor();
        return <Content backgroundColor={color} value={`Hello ${i}`} key={i} />;
      })}
  </DragDropContainer>
);

export const GhostExampleTitle = () => (
  <p>
    Scrollable container, <br />
    draggable and droppable elements <br />
    with a ghost stuck to row bottom <br />
    custom hover implementation <br />
    drag handle <br />
    and a delay of 400ms
  </p>
);

export default () => (
  <React.Fragment>
    <GhostExampleTitle />
    <GhostExample />
  </React.Fragment>
);
