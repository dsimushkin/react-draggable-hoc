export type DragEvent = MouseEvent & TouchEvent;

export const getEvent = (event: DragEvent) => {
    return event.touches ? event.touches[0] : event;
}

export const isDrag = (event: DragEvent) => {
    return event.touches ? event.touches.length === 1 : event.which === 1;
}

export const preventDefault = (e: Event) => {
    e.preventDefault();
}

export const emptyFn = () => {}
