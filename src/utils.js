export const getEvent = (event) => {
    return event.touches ? event.touches[0] : event;
};

export const isDrag = (event) => {
    return event.touches ? event.touches.length === 1 : event.which === 1;
};

export const attachEvents = (events, el) => {
    for (const e in events) {
        el.addEventListener(e, events[e]);
    }
};

export const detachEvents = (events, el) => {
    for (const e in events) {
        el.removeEventListener(e, events[e]);
    }
};

export const getRectDeltas = (rect1, rect2) => ({
    top: rect1.top - rect2.top,
    left: rect1.left - rect2.left,
    bottom: rect1.bottom - rect2.bottom,
    right: rect1.right - rect2.right
});