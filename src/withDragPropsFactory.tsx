import * as React from "react";

import DragContext from "./IDragContext";
import useDragPropsFactory from "./useDragPropsFactory";
import { IDndObserver } from "./IDndObserver";

function withDragPropsFactory<T, D extends IDndObserver<any, any, any, any>>(
  context: React.Context<DragContext<T, D>>,
) {
  const useDragProps = useDragPropsFactory(context);

  return function WithDragProps({
    children,
    disabled = false,
  }: {
    children: React.FunctionComponent<{ dragProps?: T }>;
    disabled?: boolean;
  }) {
    const dragProps = useDragProps({ disabled });
    return children({ dragProps });
  };
}

export default withDragPropsFactory;
