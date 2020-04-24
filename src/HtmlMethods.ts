import HtmlDndObserver from "./HtmlDndObserver";

export function defaultDroppableMethod<T, N extends Element>(
  state: HtmlDndObserver<T>["state"],
  n: N | React.RefObject<N>,
) {
  if (n == null || state == null) return false;
  const node = n instanceof Element ? n : n.current;
  if (node != null) {
    const nd = state.droppables.filter(
      (d) => (d as Element) !== node && node.contains(d),
    );

    for (let n of state.elementsFromPoint) {
      if (nd.some((d) => d.contains(n))) {
        return false;
      }
      if (node.contains(n)) {
        return true;
      }
    }
  }

  return false;
}
