export interface IDragStateProps {
  node: HTMLElement
  pointerX: number,
  pointerY: number,
}

export const dragStateFactory = ({
  node,
  pointerX,
  pointerY,
}: IDragStateProps) => ({
  pointerX,
  pointerY,
  rect: node.getBoundingClientRect(),
});

export class DragMonitor {
  public initial: ReturnType<typeof dragStateFactory>;
  public current?: ReturnType<typeof dragStateFactory>;
  public node: HTMLElement;

  constructor(initial: IDragStateProps, current?: IDragStateProps) {
    this.initial = dragStateFactory(initial);
    this.node = initial.node;
    if (current != null) {
      this.current = dragStateFactory(current);
    }
  }

  public next(state: IDragStateProps) {
    const {node} = this;
    return new DragMonitor(
      {...this.initial, node},
      {...dragStateFactory(state), node},
    );
  }

  get deltaX() {
    return this.current ? this.current.pointerX - this.initial.pointerX : 0;
  }

  get deltaY() {
    return this.current ? this.current.pointerY - this.initial.pointerY : 0;
  }
}
