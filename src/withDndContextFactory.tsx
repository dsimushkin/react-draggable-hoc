import * as React from "react";
import IDragContext from "./IDragContext";
import { IDndObserver } from "./IDndObserver";
import HtmlDndObserver from "./HtmlDndObserver";

function withDndContext<T, D extends IDndObserver<T, any, any>>(
  context: React.Context<IDragContext<T, D>>,
) {
  return function<K>(WrappedComponent: React.ComponentType<K>) {
    return function WithDndContext(
      props: K & { observer: HtmlDndObserver<T> },
    ) {
      return (
        <context.Consumer>
          {ctx => <WrappedComponent {...props} {...ctx} />}
        </context.Consumer>
      );
    };
  };
}

export default withDndContext;
