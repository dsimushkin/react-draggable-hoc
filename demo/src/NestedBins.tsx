import * as React from "react";

import { DragDropContainer, Draggable, Droppable } from "react-draggable-hoc";

const Target = ({
  value,
  color,
  changeValue,
  children,
}: {
  value: number;
  color: string;
  changeValue: (v: number) => void;
  children?: any;
}) => (
  <Droppable
    onDrop={() => {
      changeValue(value);
    }}
    withDragProps={false}
  >
    {({ isHovered, ref, dragProps }) => (
      <div
        className="Target"
        ref={ref}
        style={{
          backgroundColor: isHovered ? "rgba(0, 0, 110)" : color,
          border: dragProps ? "1px dashed #ccc" : undefined,
        }}
      >
        {children}
      </div>
    )}
  </Droppable>
);

export const SimpleExample = () => {
  const [value, changeValue] = React.useState(0);
  const changeValueFactory = (v: number) => () => changeValue(value + v);

  return value < 300 ? (
    <>
      <div>Your current score: {value}</div>
      <DragDropContainer style={{ width: 400, margin: "auto" }}>
        <>
          <br />
          <Draggable
            dragProps="missile"
            className="Missile-Wrapper"
            detachDelta={0}
            onDragStart={() => {
              document.body.style.cursor = "grabbing";
            }}
            onDragEnd={() => {
              document.body.style.cursor = "initial";
            }}
          >
            {({ handleRef, isDetached }) => (
              <div
                ref={handleRef}
                className="Missile"
                style={
                  handleRef != null && isDetached
                    ? { visibility: "hidden" }
                    : undefined
                }
              />
            )}
          </Draggable>
          <br />
          <Target
            value={10}
            color="#f7d916"
            changeValue={changeValueFactory(10)}
          >
            <div className="Target-Value">10</div>
            <Target
              value={25}
              color="#f72116"
              changeValue={changeValueFactory(25)}
            >
              <div className="Target-Value">25</div>
              <Target
                value={50}
                color="#f7d916"
                changeValue={changeValueFactory(50)}
              >
                <div className="Target-Value">50</div>
              </Target>
              <div className="Target-Value">25</div>
            </Target>
            <div className="Target-Value">10</div>
          </Target>
        </>
      </DragDropContainer>
    </>
  ) : (
    <div className="Congrats-page-container">Congratulations, You Win!</div>
  );
};

export default () => (
  <React.Fragment>
    <p>
      `Draggable` with hidden host and And nested `Droppable` bins.
      <br />
    </p>
    <SimpleExample />
  </React.Fragment>
);
