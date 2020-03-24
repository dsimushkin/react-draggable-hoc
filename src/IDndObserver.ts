import { DragPhase } from "./HtmlHelpers";

export type DnDPhases =
  | "dragStart"
  | "drag"
  | "cancel"
  | "drop"
  | "delayedDrag";

export interface ISharedState<T, E> {
  readonly dragProps?: T;
  cancel: () => void;
  readonly initial?: E;
  readonly current?: E;
  readonly deltaX: number;
  readonly deltaY: number;
  readonly node: any;
  getDeltas: (
    container: HTMLElement,
    rect: ClientRect | DOMRect,
  ) => { deltaX: number; deltaY: number };
}

export interface IDndObserver<T, E> {
  on: (e: DnDPhases, fn: (state: ISharedState<T, E>) => void) => void;
  off: (e: DnDPhases, fn: (state: ISharedState<T, E>) => void) => void;
  makeDraggable: (
    node: HTMLElement,
    config?: {
      delay?: number;
      dragProps?: T;
      onDragStart?: (state: ISharedState<T, E>) => void;
      onDelayedDrag?: (state: ISharedState<T, E>) => void;
      onDrop?: (state: ISharedState<T, E>) => void;
      onDrag?: (state: ISharedState<T, E>) => void;
      onDragCancel?: (state: ISharedState<T, E>) => void;
    },
  ) => () => void;
  init: () => void;
  destroy: () => void;
  state: ISharedState<T, E>;
  stopPropagation: (node: HTMLElement, ...phases: DragPhase[]) => () => void;
}
