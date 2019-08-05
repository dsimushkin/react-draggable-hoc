export type DragEvent = MouseEvent & TouchEvent;

export const getPointer = (event: DragEvent) => {
    return event.touches ? event.touches[0] : (event.changedTouches ? event.changedTouches[0] : event);
}

export const isDragStart = (event: DragEvent) => {
    return event.touches ? event.touches.length === 1 : event.which === 1;
}

export const eventsDiff = (a: DragEvent, b: DragEvent) => {
    const aPointer = getPointer(a);
    const bPointer = getPointer(b);
    return {
        x: bPointer.pageX - aPointer.pageX,
        y: bPointer.pageY - aPointer.pageY,
    }
}

export const emptyFn = () => {}
