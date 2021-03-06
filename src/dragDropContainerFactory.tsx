import * as React from "react";

import DragContext from "./IDragContext";

import HtmlDndObserver from "./HtmlDndObserver";
import { defaultDroppableMethod } from "./HtmlMethods";

function dragDropContainer<T>(
  context: React.Context<DragContext<T, HtmlDndObserver<T>>>,
) {
  const observer = new HtmlDndObserver<T>();

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
      <context.Provider
        value={{ observer, defaultDroppableMethod, container: ref }}
      >
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
