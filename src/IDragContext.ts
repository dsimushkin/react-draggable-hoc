import * as React from "react";
import { IDndObserver } from "./IDndObserver";

interface IDragContext<T, D extends IDndObserver<T, any, any>> {
  observer: D;
  container?: React.RefObject<any>;
}

export default IDragContext;
