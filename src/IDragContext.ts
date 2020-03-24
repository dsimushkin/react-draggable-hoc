import * as React from "react";
import { IDndObserver } from "./IDndObserver";

interface IDragContext<T, E> {
  observer: IDndObserver<T, E>;
  container?: React.RefObject<any>;
}

export default IDragContext;
