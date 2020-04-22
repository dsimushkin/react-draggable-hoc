import HtmlDndObserver from "./HtmlDndObserver";

export function defaultDroppableMethod<T, N extends Element>(
  state: HtmlDndObserver<T>["state"],
  n: N | React.RefObject<N>,
) {
  if (n == null) return false;
  const node = n instanceof Element ? n : n.current;
  if (node != null) {
    return getElementsFromPointInState(state).some((n) => node.contains(n));
  }

  return false;
}

export function getElementsFromPointInState<T>(
  state: HtmlDndObserver<T>["state"],
) {
  if (state != null && state.current != null) {
    const { x, y } = state.current;
    return [].slice.call(document.elementsFromPoint(x, y));
  }

  return [];
}
