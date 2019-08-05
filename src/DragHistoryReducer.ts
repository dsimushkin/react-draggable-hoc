import { DragEvent, getPointer } from "./utils";

export const DRAG_START_MESSAGE = "dragStart";
export const DRAG_MESSAGE = "drag";
export const DROP_MESSAGE = "drop";

export interface IDragEvent {
  x: number,
  y: number,
  node: HTMLElement,
  rect: ClientRect | DOMRect
}

const initialState: IDragEvent[] = [];

interface IDragStart {
  type: typeof DRAG_START_MESSAGE,
  payload: IDragEvent
}

interface IDrag {
  type: typeof DRAG_MESSAGE,
  payload: IDragEvent
}

interface IDrop {
  type: typeof DROP_MESSAGE
}

export type DragAction = IDragStart | IDrag | IDrop;

export function dragPayloadFactory(event: DragEvent) {
  const {pageX, pageY} = getPointer(event);
  const node = event.target as HTMLElement;
  return {
    node,
    rect: node.getBoundingClientRect(),
    x: pageX,
    y: pageY,
  };
}

export function dragStatsFactory(history: typeof initialState = []) {
  const initial = history.length > 0 ? history[0] : undefined;
  const current = history.length > 0 ? history[history.length - 1] : undefined;
  return {
    current,
    history,
    initial,
    isDragged: current != null,
    node: initial ? initial.node : undefined,
    x: current && initial ? current.x - initial.x : 0,
    y: current && initial ? current.y - initial.y : 0,
  }
}

export type DragStats = ReturnType<typeof dragStatsFactory>;

export default function(
  state = initialState,
  action: DragAction,
) {
  switch (action.type) {
    case DRAG_START_MESSAGE: {
      return [action.payload]
    }
    case DRAG_MESSAGE: {
      return [...state, action.payload];
    }
    case DROP_MESSAGE:
      return [];
    default: throw new Error();
  }
}
