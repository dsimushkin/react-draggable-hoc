import PubSub from "./PubSub";

export type DnDPhases =
  | "dragStart"
  | "drag"
  | "cancel"
  | "drop"
  | "delayedDrag"
  | "dragPropsChange";

export interface ISharedState<T, E, N> {
  readonly initial?: { x: number; y: number; event: E };
  readonly current?: { x: number; y: number; event: E };
  readonly history: { x: number; y: number; event: E }[];
  readonly deltaX: number;
  readonly deltaY: number;
  cancel: () => void;
  dragProps?: T;
  readonly node?: N;
  readonly wasDetached: Boolean;
}

export interface IDndObserver<T, E, N, S extends ISharedState<T, E, N>> {
  makeDraggable(
    node: N,
    config: {
      delay?: number;
      dragProps: T;
      onDragStart?: (state: S) => void;
      onDelayedDrag?: (state: S) => void;
      onDrop?: (state: S) => void;
      onDrag?: (state: S) => void;
      onDragPropsChange?: (state: S) => void;
      onDragCancel?: (...args: any) => void;
    },
  ): () => void;
  init(): void;
  destroy(): void;
  cancel(): void;
  cleanup(): void;

  dragProps?: T;
  dragged?: N;
  wasDetached: Boolean;
  history: S["history"];

  on: PubSub<DnDPhases, (state: S) => void>["on"];
  off: PubSub<DnDPhases, (state: S) => void>["off"];

  readonly state: S;
}
