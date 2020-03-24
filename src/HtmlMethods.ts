import { IHtmlDndObserver } from "./HtmlDndObserver";

export function defaultDroppableMethod<T>(
  state: IHtmlDndObserver<T>["state"],
  ref: React.RefObject<any>,
) {
  const node = ref.current;
  if (state.current && node) {
    const { x, y } = state.current;
    return document.elementsFromPoint(x, y).indexOf(node) >= 0;
  }

  return false;
}