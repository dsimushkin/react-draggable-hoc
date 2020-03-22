import * as React from "react";

import { DragMonitor } from "./DragMonitor";
import DragContext from "./IDragContext";

function dragDropContainer(context: React.Context<DragContext>) {
  const monitor = new DragMonitor();

  return function DragDropContainer({
    children,
    ...props
  }: {
    children:
      | React.ReactNode
      | React.FunctionComponent<{
          ref?: React.RefObject<any>;
        }>;
  } & Omit<JSX.IntrinsicElements["div"], "children">) {
    const ref = React.useRef(null);

    return (
      <context.Provider value={{ monitor, container: ref }}>
        {typeof children === "function" ? (
          children({ ref })
        ) : (
          <div {...props} ref={ref}>
            {children}
          </div>
        )}
      </context.Provider>
    );
  };
}

export default dragDropContainer;
