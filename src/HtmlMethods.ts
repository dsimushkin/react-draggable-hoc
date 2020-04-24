import HtmlDndObserver from "./HtmlDndObserver";

/**
 * Calculates if an Element or a React.Ref of an Element
 * is hovered by the HtmlDndObserver state.
 *
 * This is the defaultDroppableMethod of the useDroppable hook.
 *
 * Checks if nested or higher priority droppables doesn't contain
 * state.elementsFromPoint and if the node contains.
 *
 * @param state
 * @param n
 */
export function defaultDroppableMethod<T, N extends Element>(
  state: HtmlDndObserver<T>["state"],
  n: N | React.RefObject<N>,
) {
  if (n == null || state == null) return false;
  const node = n instanceof Element ? n : n.current;
  if (node != null) {
    const d = state.droppables.find(({ node: d }) => (d as Element) === node);
    const priority =
      d != null && d.config.priority != null ? d.config.priority : -1;
    const nd = state.droppables.filter(
      ({ node: d, config }) =>
        ((d as Element) !== node && node.contains(d)) ||
        (config.priority != null && config.priority > priority),
    );

    if (
      state.elementsFromPoint.some((n) => nd.some((d) => d.node.contains(n)))
    ) {
      return false;
    }

    if (state.elementsFromPoint.some((n) => node.contains(n))) {
      return true;
    }
  }

  return false;
}
