import * as React from "react";

import {
  DragDropContainer,
  Draggable,
  Droppable,
  defaultPostProcessor,
  WithDragProps,
} from "react-draggable-hoc";

const sleep = (ms?: number) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
};

const randomColor = () => {
  const randomPart = () => Math.floor(Math.random() * 255);
  return "rgb(" + randomPart() + "," + randomPart() + "," + randomPart() + ")";
};

type DraggedPropsType = ReturnType<typeof randomColor>;

// use a separate component to create a ghost
const ContentElement = ({ className = "", style, handleRef, value }: any) => {
  const ref = React.useRef(null);
  return (
    <span style={style} className={`Cell ${className}`}>
      <div className="handle" ref={handleRef}>
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
  draggedProps?: DraggedPropsType;
}

// stick to line
const postProcess = (props: any, ref: React.RefObject<any>) => {
  return {
    ...defaultPostProcessor(props, ref),
    deltaY: ref && ref.current ? ref.current.clientHeight : 0,
  };
};

const Content = ({ backgroundColor, value, draggedProps }: IContentProps) => {
  const [color, changeColor] = React.useState<string>();

  return (
    <Draggable
      delay={20}
      dragProps={backgroundColor}
      postProcess={postProcess}
      onDragStart={() => {
        document.body.style.cursor = "ew-resize";
      }}
      onDragEnd={() => {
        document.body.style.cursor = "initial";
      }}
    >
      {({ handleRef, isDetached }) =>
        handleRef != null ? (
          <Droppable
            onDrop={async ({ dragProps }) => {
              await sleep(0);
              if (dragProps !== backgroundColor) {
                changeColor(dragProps as string);
              }
            }}
            method={(state, nodeRef) => {
              const a = nodeRef.current.getBoundingClientRect();
              const { x } = state.current!;

              return a.left <= x && a.right >= x;
            }}
            disabled={handleRef == null}
            withDragProps={false}
          >
            {({ isHovered, ref }) => (
              <div
                style={{
                  display: "inline-block",
                  textAlign: "left",
                  position: "relative",
                }}
                ref={ref}
              >
                {/* change text color when element is dragged */}
                <ContentElement
                  value={
                    draggedProps
                      ? draggedProps === backgroundColor
                        ? isHovered
                          ? "Not here"
                          : "I'm dragged"
                        : isHovered
                          ? "Drop here"
                          : "Hover me"
                      : value
                  }
                  style={{
                    backgroundColor,
                    color: isDetached ? "#fff" : color,
                    width: "100px",
                  }}
                  className={
                    isHovered && draggedProps !== backgroundColor
                      ? "hovered"
                      : undefined
                  }
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
              color,
              width: "100px",
            }}
          />
        )
      }
    </Draggable>
  );
};

const randomColors = Array(3000)
  .fill(0)
  .map(() => randomColor());

export const GhostExample = () => {
  return (
    <DragDropContainer className="Ghost-container">
      {({ ref }) => (
        <WithDragProps>
          {({ dragProps: draggedProps }) => (
            <div className="Ghost-container" ref={ref}>
              {randomColors.map((color, i) => (
                <Content
                  backgroundColor={color}
                  value={`Drag me`}
                  key={i}
                  draggedProps={draggedProps}
                />
              ))}
            </div>
          )}
        </WithDragProps>
      )}
    </DragDropContainer>
  );
};

export const GhostExampleTitle = () => (
  <p>
    Scrollable container, <br />
    draggable and droppable elements <br />
    with a ghost stuck to row bottom <br />
    custom hover implementation <br />
    drag handle <br />
    delay of 20ms (scroll is still preserved) <br />
    and fixed body <br />
    ew-resize cursor on drag
  </p>
);

export default () => {
  React.useEffect(() => {
    document.body.style.position = "fixed";

    return () => {
      document.body.style.position = "initial";
    };
  });

  return (
    <React.Fragment>
      <GhostExampleTitle />
      <GhostExample />
    </React.Fragment>
  );
};
