export type DnDPhases =
  | "dragStart"
  | "drag"
  | "cancel"
  | "drop"
  | "delayedDrag";

export interface ISharedState<T, E, N> {
  readonly dragProps?: T;
  cancel: () => void;
  readonly initial?: { x: number; y: number; event: E };
  readonly current?: { x: number; y: number; event: E };
  readonly history: { x: number; y: number; event: E }[];
  readonly deltaX: number;
  readonly deltaY: number;
  readonly node?: N;
  readonly wasDetached: Boolean;
}

export interface IDndObserver<T, E, N> {
  on: (e: DnDPhases, fn: (state: ISharedState<T, E, N>) => void) => () => void;
  off: (e: DnDPhases, fn: (state: ISharedState<T, E, N>) => void) => void;
  makeDraggable: (
    node: N,
    config?: {
      delay?: number;
      dragProps?: T;
      onDragStart?: (state: ISharedState<T, E, N>) => void;
      onDelayedDrag?: (state: ISharedState<T, E, N>) => void;
      onDrop?: (state: ISharedState<T, E, N>) => void;
      onDrag?: (state: ISharedState<T, E, N>) => void;
      onDragCancel?: (state: ISharedState<T, E, N>) => void;
    },
  ) => () => void;
  init: () => void;
  destroy: () => void;
  state: ISharedState<T, E, N>;
}
