# React Draggable Higher Order Component

A set of react hooks and components used to gain full control on dragging and dropping HTML nodes.

Supports touch and mouse events. Prevents from scrolling only on drag.

## [Demo](http://dsimushkin.github.io/react-draggable-hoc)

## [Demo with sources](https://codesandbox.io/s/github/dsimushkin/react-draggable-hoc/tree/master/demo)

## Basic usage

Package provides a realization of the `useDraggable` hook, called `Draggable`, which can be used for simple case scenarios.

```jsx
import { Draggable } from "react-draggable-hoc";

<Draggable>
  <div className="draggable">...</div>
</Draggable>;
```

or if you want need a handle, use a prop of a functional child component called handleRef as a ref to your handle

```jsx
import { Draggable } from "react-draggable-hoc";

<Draggable>
  {({ handleRef, isDetached }) => (
    <div className={`draggable${isDetached ? " dragged" : ""}`} ref={handleRef}>
      ...
    </div>
  )}
</Draggable>;
```

Additionally `Draggable` component supports the following properties:

| property name                      | type                        | description                                                                                                                                         |
| ---------------------------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| dragProps                          | any                         | options that will be passed to droppable in onDrop method                                                                                           |
| className = "draggable"            | string                      | class name                                                                                                                                          |
| children                           | JSX or functional component | Rendered twice: as a node inplace and as a detached element. In case of a functional component `handleRef` will be passed only for the node inplace |
| postProcess = defaultPostProcessor | (drag props, ref)           | Used to inject custom properties into drag props. Useful for changes in positioning                                                                 |
| detachDelta = 20                   | number                      | A delta that is used to detach (influences isDetached for functional children)                                                                      |
| delay = 100                        | number                      | A delay in ms. If a move event is fired within a delay, from the moment the drag is started, the drag will be canceled.                             |
| detachedParent = document.body     | HTMLNode                    | HTML node, where the detached element will be rendered                                                                                              |
| onDragStart                        | () => any                   | A function fired when the drag is started (after delay)                                                                                             |
| onDragEnd                          | () => any                   | A function fired when the drag is finished                                                                                                          |

If you want the node to be dragged only inside a container, use `DragDropContainer`

```jsx
import { Draggable, DragDropContainer } from "react-draggable-hoc";

<DragDropContainer>
  <div>
    ...
    <Draggable />
    ...
  </div>
</DragDropContainer>;
```

If you need a droppable target, you can use a realization of `DragDropContainer` context usage called `Droppable` with a `functional` child component.
Don't forget to provide dragProps to the `Draggable` if you want to be able to differentiate between draggables.

```jsx
import { Draggable, DragDropContainer, Droppable } from "react-draggable-hoc";

<DragDropContainer>
  <div>
    ...
    <Draggable dragProps="this is a prop that will be passed to onDrop" />
    ...
    <Droppable
      onDrop={dragProps => {
        console.log(`Dropped: ${dragProps}`);
      }}
    >
      {({ isHovered, ref, dragProps }) => (
        <div className={isHovered ? "hovered" : undefined} ref={ref}>
          ...
        </div>
      )}
    </Droppable>
    ...
  </div>
</DragDropContainer>;
```

While all of the above implementation are helpful to achieve fast results, the main purpose of the packase is provide capavilites to implement draggable components in just a couple of lines of code. For this purpose a `useDraggable` should be used.

```jsx
import { useDraggable } form "react-draggable-hoc"

function MyComponent({dragProps}) {
    const ref = React.useRef();  // create a reference for the DOM node
    const { isDragged, deltaX, deltaY } = useDraggable(
        ref,
        { dragProps, delay: 100 }
    ); // use the hook with drag indication delay (useful for touch devices)

    return (
        <div
            ref={ref}
            style={
                // add drag deltas to the DOM node position
                isDragged ? {
                    transform: `translate3d(${deltaX}px, ${deltaY}px, 0)`
                } : undefined
            }
        >
            ...
        </div>
    )
}
```

---

## THIS IS THE TITLE PAGE OF THE DOCUMENTATION. FULL API DESCRIPTION WILL FOLLOW.
