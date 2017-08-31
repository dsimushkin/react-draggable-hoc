export default class Monitor {
    constructor(container) {
        this.container = container;
        this.clean();
    }

    clean() {
        this.initial = {};
        delete this.dragged;
        delete this.hovered;
        this.x = 0;
        this.y = 0;
        delete this.clientX;
        delete this.clientY;
        delete this.cursorX;
        delete this.cursorY;
        this.cleanGhost();
    }

    cleanGhost() {
        if (this.ghost) {
            this.ghost.remove();
            delete this.ghost;
        }
    }

    drawGhost() {
        if (this.container.props.useGhost) {
            requestAnimationFrame(() => {
                this.cleanGhost();

                if (this.dragged) {
                    const { el } = this.dragged;
                    // create ghost
                    const clone = el.cloneNode(true);
                    clone.classList.add('draggable-ghost');
                    
                    // position ghost
                    clone.style.position = 'absolute';
                    clone.style.top = el.offsetTop+'px';
                    clone.style.left = el.offsetLeft+'px';

                    // insert ghost
                    el.parentNode.appendChild(clone);

                    this.ghost = clone;
                    this.doPositionDragged();
                }
            })
        }
    }

    doPositionDragged() {
        if (this.x !== null && this.y !== null && this.dragged) {
            (this.ghost || this.dragged.el).style.transform = `translate3d(${this.x}px,${this.y}px, 0px)`;
        }
    }
}