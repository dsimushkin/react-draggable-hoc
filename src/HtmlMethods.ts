import HtmlDndObserver from "./HtmlDndObserver";

export function defaultDroppableMethod<T, N extends Element>(
  state: HtmlDndObserver<T>["state"],
  n: N | React.RefObject<N>,
) {
  if (n == null) return false;
  const node = n instanceof Element ? n : n.current;
  if (node != null) {
    return state.elementsFromPoint.some((n) => node.contains(n));
  }

  return false;
}
