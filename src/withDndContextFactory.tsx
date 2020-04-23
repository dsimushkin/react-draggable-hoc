import * as React from "react";
import IDragContext from "./IDragContext";
import { IDndObserver } from "./IDndObserver";

function withDndContext<T, D extends IDndObserver<T, any, any, any>>(
  context: React.Context<IDragContext<T, D>>,
) {
  return function <K>(WrappedComponent: React.ComponentType<K>) {
    return function WithDndContext(props: K & { observer: D }) {
      return (
        <context.Consumer>
          {(ctx) => <WrappedComponent {...props} {...ctx} />}
        </context.Consumer>
      );
    };
  };
}

export default withDndContext;
