import * as React from "react";

import { DragMonitor } from "./DragMonitor";

export const DragContext = React.createContext<{
  monitor: DragMonitor;
  container?: React.RefObject<any>;
}>({
  monitor: new DragMonitor(),
  container: undefined
});

function dragDropContainer(context: typeof DragContext) {
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
