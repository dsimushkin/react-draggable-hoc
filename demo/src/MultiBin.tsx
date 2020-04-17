import * as React from "react";

import {
  DragDropContainer,
  Draggable,
  useDroppable,
  useDragProps,
} from "react-draggable-hoc";

const colors = ["Plum", "CornflowerBlue"];

const initialValues = Array(colors.length * 10)
  .fill(undefined)
  .map((_, i) => i + 1);

const maxDroppedPerBin = initialValues.length / colors.length;

type DragProps = {
  color: "string";
  i: number;
};

const Bin = ({
  handleDrop,
  color,
  onFill,
}: {
  handleDrop: (props: DragProps) => any;
  color: string;
  onFill: () => void;
}) => {
  const ref = React.useRef(null);
  const [droppedCount, changeDroppedCount] = React.useState(0);

  const validateDragProps = React.useCallback(
    (props: DragProps) => props == null || props.color === color,
    [color],
  );

  const { isHovered } = useDroppable(ref, {
    onDrop: ({ dragProps }) => {
      if (validateDragProps(dragProps)) {
        changeDroppedCount(droppedCount + 1);
        handleDrop(dragProps);
      }
    },
  });

  const dragProps = useDragProps();

  const dragPropsValid = React.useMemo(() => {
    return validateDragProps(dragProps);
  }, [dragProps, validateDragProps]);

  const filled = React.useMemo(() => {
    return (100 * droppedCount) / maxDroppedPerBin;
  }, [droppedCount]);

  const added = React.useMemo(() => {
    return isHovered ? 100 / maxDroppedPerBin : 0;
  }, [isHovered]);

  React.useEffect(() => {
    if (filled) onFill();
  }, [filled, onFill]);

  return (
    <div
      className="Simple-bin"
      ref={ref}
      style={{
        visibility: dragPropsValid ? undefined : "hidden",
        border: dragProps ? "1px dashed #ccc" : "1px dashed transparent",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          display: "flex",
        }}
      >
        <div
          style={{
            width: `${filled}%`,
            background: color,
            transition: "all linear 40ms",
          }}
        />
        <div
          style={{
            width: `${added}%`,
            background: `linear-gradient(to right, ${color}, #eee)`,
            transition: "all linear 40ms",
          }}
        />
      </div>
      <div style={{ position: "relative" }}>
        <span style={{ color }}>{color}</span>
      </div>
    </div>
  );
};

export const SimpleExample = () => {
  const [values, changeValues] = React.useState(initialValues);
  const [color, changeColor] = React.useState<string>();

  const handleDrop = (dragProps: DragProps) => {
    changeValues(values.filter((v) => v !== dragProps.i));
  };

  return (
    <DragDropContainer className="Simple-page-container">
      <div className="Simple-row scrollable">
        {values.map((i) => (
          <Draggable
            key={i}
            dragProps={{ color: colors[i % colors.length], i }}
            className="Simple-cell"
          >
            <div
              className="Cell-simple"
              style={{ backgroundColor: colors[i % colors.length] }}
            >
              <span style={{ color: "#fff" }}>{i}</span>
            </div>
          </Draggable>
        ))}
      </div>
      {values.length > 0 ? (
        <div className="Bins-container">
          {[...Array(colors.length)].map((_, i) => (
            <Bin
              handleDrop={handleDrop}
              color={colors[i % colors.length]}
              onFill={() => {
                if (color == null) changeColor(colors[i % colors.length]);
              }}
              key={i}
            />
          ))}
        </div>
      ) : (
        <div className="Simple-bin">
          <span style={{ color }}>Congratulations!</span>
          <span>You win!</span>
        </div>
      )}
    </DragDropContainer>
  );
};

export default () => (
  <React.Fragment>
    <p>
      Simple `Draggable` and multiple droppable bins defined by `useDroppable`
      <br />
    </p>
    <SimpleExample />
  </React.Fragment>
);
