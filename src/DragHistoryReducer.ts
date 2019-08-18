import { DragEvent, getPointer } from "./utils";

export const DRAG_START_MESSAGE = "dragStart";
export const DRAG_MESSAGE = "drag";
export const DROP_MESSAGE = "drop";

export function dragPayloadFactory(event: DragEvent, node: HTMLElement) {
  const {pageX, pageY} = getPointer(event);
  return {
    node,
    rect: node.getBoundingClientRect(),
    x: pageX,
    y: pageY,
  };
}
export type IDragEvent = ReturnType<typeof dragPayloadFactory>;

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

export function dragStatsFactory(history: IDragEvent[] = []) {
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
