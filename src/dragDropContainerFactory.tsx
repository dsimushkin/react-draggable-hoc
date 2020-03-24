import * as React from "react";

import DragContext from "./IDragContext";

import HtmlDndObserver, { IHtmlDndObserver } from "./HtmlDndObserver";

function dragDropContainer<T>(
  context: React.Context<DragContext<T, IHtmlDndObserver<T>>>,
) {
  const observer = HtmlDndObserver<T>();

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
      <context.Provider value={{ observer, container: ref }}>
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
