import * as React from "react";

import {
  DragDropContainer,
  Draggable,
  Droppable,
  defaultPostProcessor,
  useDragStopPropagation
} from "react-draggable-hoc";

import useDragPhaseListener from "react-draggable-hoc/lib/useDragPhaseListener";

const randomColor = () => {
  const randomPart = () => Math.floor(Math.random() * 255);
  return "rgb(" + randomPart() + "," + randomPart() + "," + randomPart() + ")";
};

// use a separate component to create a ghost
const ContentElement = ({ className = "", style, handleRef, value }: any) => {
  const ref = React.useRef(null);
  useDragStopPropagation(ref, "dragStart");
  return (
    <span style={style} className={`Cell ${className}`} ref={handleRef}>
      <div className="handle">
        <div className="bar" style={{ backgroundColor: style.color }} />
        <div className="bar" style={{ backgroundColor: style.color }} />
        <div className="bar" style={{ backgroundColor: style.color }} />
      </div>
      <span ref={ref}>{value}</span>
    </span>
  );
};

interface IContentProps {
  value: string;
  backgroundColor: string;
}

const postProcess = (props: any, ref: any) => {
  return {
    ...defaultPostProcessor(props, ref),
    deltaY: ref && ref.current ? ref.current.clientHeight : 0
  };
};

const Content = ({ backgroundColor, value }: IContentProps) => {
  const [color, changeColor] = React.useState<string>();

  const onDrop = (dragProps: string) => {
    changeColor(dragProps);
  };

  return (
    <Draggable
      delay={100}
      dragProps={backgroundColor}
      postProcess={postProcess}
      onDragStart={() => {
        document.body.style.cursor = "ew-resize";
      }}
      onDragEnd={() => {
        document.body.style.cursor = "default";
      }}
    >
      {({ handleRef, isDragged }: any) =>
        handleRef != null ? (
          <Droppable
            onDrop={onDrop}
            method={(monitor, nodeRef) => {
              const a = nodeRef.current.getBoundingClientRect();
              const { x } = monitor.current!;

              return a.left <= x && a.right >= x;
            }}
          >
            {({ isHovered, ref }: any) => (
              <div
                style={{
                  display: "inline-block",
                  textAlign: "left",
                  position: "relative"
                }}
                ref={ref}
              >
                {/* change text color when element is dragged */}
                <ContentElement
                  value={value}
                  style={{
                    backgroundColor,
                    color: isDragged ? "red" : color
                  }}
                  className={isHovered ? "hovered" : undefined}
                  handleRef={handleRef}
                />
              </div>
            )}
          </Droppable>
        ) : (
          <ContentElement
            value={value}
            style={{
              backgroundColor,
              color
            }}
          />
        )
      }
    </Draggable>
  );
};

export const GhostExample = () => (
  <DragDropContainer className="Ghost-container">
    {({ ref }) => (
      <div className="Ghost-container" ref={ref}>
        {Array(20)
          .fill(0)
          .map((_, i) => {
            const color = randomColor();
            return (
              <Content backgroundColor={color} value={`Hello ${i}`} key={i} />
            );
          })}
      </div>
    )}
  </DragDropContainer>
);

export const GhostExampleTitle = () => (
  <p>
    Scrollable container, <br />
    draggable and droppable elements <br />
    with a ghost stuck to row bottom <br />
    custom hover implementation <br />
    drag handle <br />
    and a delay of 100ms <br />
    ew-resize cursor on drag
  </p>
);

export default () => (
  <React.Fragment>
    <GhostExampleTitle />
    <GhostExample />
  </React.Fragment>
);
