import * as React from 'react';
import { IDraggableProps } from 'react-draggable-hoc';

export interface IDraggableElementProps {
    children?: any,
    className?: any,
    style?: any,
    value?: string,
}

/**
 * Simple React Component to render a draggable
 * @param param props
 */
export const DraggableElement = (
    {children, x, y, isDragged, style={}, className} : IDraggableElementProps & IDraggableProps
) => (
    <div
        className={className}
        style={{
            ...style,
            transform: isDragged ? `translate3d(${x}px, ${y}px, -1px)` : undefined,
            transition: isDragged ? undefined : 'transform 1s'
        }}
    >
        {children}
    </div>
);