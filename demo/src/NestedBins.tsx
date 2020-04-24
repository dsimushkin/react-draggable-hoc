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

  return (
    <DragDropContainer style={{ width: 500, margin: "auto" }}>
      {value < 1000 ? (
        <>
          <div>Your current score: {value}</div>
          <br />
          <Draggable dragProps="missile" className="Missile-Wrapper">
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
            <Target
              value={25}
              color="#f72116"
              changeValue={changeValueFactory(25)}
            >
              <Target
                value={50}
                color="#f7d916"
                changeValue={changeValueFactory(50)}
              />
            </Target>
          </Target>
        </>
      ) : (
        <div className="Simple-bin">Congratulations, You Win!</div>
      )}
    </DragDropContainer>
  );
};

export default () => (
  <React.Fragment>
    <p>
      Simple `Draggable` and And nested `Droppable` bins
      <br />
    </p>
    <SimpleExample />
  </React.Fragment>
);
