import * as React from "react";

import { DragMonitor } from "./DragMonitor";

export const DragContext = React.createContext({
  monitor: new DragMonitor()
});

export function dragDropContainerFactory(context: typeof DragContext) {
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

    React.useEffect(() => {
      monitor.container = ref.current || undefined;
    });

    return (
      <context.Provider value={{ monitor }}>
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

export const DragDropContainer = dragDropContainerFactory(DragContext);
