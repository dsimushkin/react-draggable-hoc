# React Draggable Higher Order Component

A set of react hooks, hocs and components used to gain full control on DnD process.

Browser realization supports touch and mouse events. Prevents from scrolling only on drag (`NOTE`: when `delay` > `0`).

## [Demo](http://dsimushkin.github.io/react-draggable-hoc)

## [Demo with sources](https://codesandbox.io/s/github/dsimushkin/react-draggable-hoc/tree/master/demo)

## Browser basic usage

Package provides a realization of the `useDraggable` hook, called `Draggable`, which can be used for simple case scenarios.

```jsx
import { Draggable } from "react-draggable-hoc";

<Draggable>
  <div className="draggable">...</div>
</Draggable>;
```

or if you need a handle, use a prop of a functional child component called handleRef as a ref to your handle

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

| property name                      | type                        | description                                                                                                                                                    |
| ---------------------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| dragProps `[required]`             | any                         | Used as a key of the draggable component. Used to attach/re-attach listeners and other manipulations. i.e. it can be used to handle drop by droppable targets. |
| className = "draggable"            | string                      | class name                                                                                                                                                     |
| children                           | JSX or functional component | Rendered twice: as a node inplace and as a detached element. In case of a functional component `handleRef` will be passed only for the node inplace            |
| postProcess = defaultPostProcessor | (drag props, ref)           | Used to inject custom properties into drag props. Useful for changes in positioning                                                                            |
| detachDelta = 20                   | number                      | A delta that is used to detach (influences isDetached for functional children)                                                                                 |
| delay = 30                         | number                      | A delay in ms. If a move event is fired within a delay, from the moment the drag is started, the drag will be canceled.                                        |
| detachedParent = document.body     | HTMLNode                    | HTML node, where the detached element will be rendered                                                                                                         |
| onDragStart                        | () => any                   | A function fired when the drag is started (after delay)                                                                                                        |
| onDragEnd                          | () => any                   | A function fired when the drag is finished                                                                                                                     |
| throttleMs = 10                    | number                      | Throttling in ms. If equal to 0, throttling is disabled                                                                                                        |
| disabled = false                   | Boolean                     | Flag for disabling draggability                                                                                                                                |

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

`NOTE:` don't forget to provide `dragProps` to the `Draggable`.

```jsx
import { Draggable, DragDropContainer, Droppable } from "react-draggable-hoc";

<DragDropContainer>
  <div>
    ...
    <Draggable dragProps="this is a prop that will be passed to onDrop" />
    ...
    <Droppable
      onDrop={({ dragProps }) => {
        console.log(`Dropped: ${dragProps}`);
      }}
    >
      {({ isHovered, ref }) => (
        <div className={isHovered ? "hovered" : undefined} ref={ref}>
          ...
        </div>
      )}
    </Droppable>
    ...
  </div>
</DragDropContainer>;
```

`NOTE:` if you use a lot of droppables, optional flag `withDragProps` of `Droppable` should be set to `false` to enhance performance and prevent re-rendering the element on drag start. To inject `dragProps` use `WithDragProps` as a parent of all droppables like this:

```jsx
import { Draggable, DragDropContainer, Droppable, WithDragProps } from "react-draggable-hoc";

<DragDropContainer>
  <div>
    <WithDragProps>
      {({dragProps}) => (
        ...
        <Draggable dragProps="this is a prop that will be passed to onDrop" />
        ...
        <Droppable
          withDragProps={false}
          onDrop={({dragProps}) => {
            console.log(`Dropped: ${dragProps}`);
          }}
        >
          {({ isHovered, ref }) => (
            <div className={isHovered ? "hovered" : undefined} ref={ref}>
              {dragProps ? "Drop it here" : null}
            </div>
          )}
        </Droppable>
        ...
      )}
    </WithDragProps>
  </div>
</DragDropContainer>;
```

Nested (with respect to HTML DOM) droppables are supported from the box.

`NOTE:` when droppables are not nested from DOM perspective but nodes overlap should be handled, one can utilize `priority` prop/setting.

---

## Browser advanced usage

While all of the above implementation are helpful to achieve fast results, the main purpose of the packase is provide capabilites to implement draggable components in just a couple of lines of code. For this purpose a `useDraggable` should be used

```jsx
import { useDraggable } form "react-draggable-hoc"

function MyDraggable({dragProps}) {
    const ref = React.useRef();  // create a reference for the DOM node
    const { isDragged, deltaX, deltaY, state, container } = useDraggable(
        ref,
        {
          dragProps,
          delay: 100, // mobile browsers can trigger text selection for big values, small values are useful when a parent is scrollable
          onDragStart: (state) => {},
          onDrag: (state) => {},
          onDrop: (state) => {},
          onDelayedDrag: (state) => {},
          onDragCancel: (state) => {},
          disabled: false,
        }
    );

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

If instead you need a component that will handle situations, when smth is dropped on it, you might use a `useDroppable`

(`NOTE:` works only for draggables with `dragProps`)

```jsx
import { useDroppable } form "react-draggable-hoc"

function MyDropable({doSmthOnDrop}) {
    const ref = React.useRef();  // create a reference for the DOM node
    const { isHovered } = useDroppable(
        ref,
        {
          method: (state, ref, defaultMethod),
          onDrop: (state) => {
            if (typeof doSmthOnDrop === "function") {
              doSmthOnDrop();
            }
          },
          disabled = false
        }
    );

    return (
        <div
            ref={ref}
            style={
              isHovered ? {
                  color: "red"
              } : undefined
            }
        >
            ...
        </div>
    )
}
```

if you need to enforce update on `dragProps` change during `drag start`, `drop` or `drag cancel` you can use `useDragProps` hook

```jsx
import { useDragProps } form "react-draggable-hoc"

function MyComponent() {
  const dragProps = useDragProps({disabled: false});

  ...
}
```

or a synthetic sugar called `WithDragProps`, which is a Component wrapper of the `useDragProps` with functional children.

Most of the hooks lifecycle methods take `state` as a parameter. It represents the state of the Dnd observer events cache and calculated values:

```ts
interface ISharedState<T, E, N> {
  dragProps: T; // dragProps of the current draggable
  cancel: () => void; // helper method to cancel the drag
  initial?: { x: number; y: number; event: E }; // drag start cache
  current?: { x: number; y: number; event: E }; // cache of the current event
  history: { x: number; y: number; event: E }[]; // dnd history
  deltaX: number; // change of the pageX during Dnd
  deltaY: number; // change of the pageY during Dnd
  node: N; // dragged element
  wasDetached: Boolean; // if at least one drag event was fired (useful for detecting click events)
}
```

---

## Experimental features

Currently, context observer supports changing `dragProps` on the fly. It can be used in cases when a pointerdown produces DOM modifications and a new element, that should be considered dragged, is created. But due to component lifecycle with hooks, swapping `dragProps` should be done in useEffect hook or before the DOM is rendered/created.

---

## Ninja usage

The whole idea behind the library was to create a single realization to quickly handle both touch and mouse devices in cases when a developer needs full controll of the Dnd elements. Therefore an implementation of the Browser Dnd Observer was written. Hooks are only a synthetic sugar around this implementation.

Hooks utilize `DragContext` (React context API) behind the curtains, which injects the following observer

```ts
// drag phases
type DnDPhases =
  | "dragStart"
  | "drag"
  | "cancel"
  | "drop"
  | "delayedDrag"
  | "dragPropsChange";

interface IDndObserver<T, E, N> {
  makeDraggable(
    node: N,
    config?: {
      delay?: number;
      dragProps?: T;
      onDragStart?: (state: ISharedState<T, E, N>) => void;
      onDelayedDrag?: (state: ISharedState<T, E, N>) => void;
      onDrop?: (state: ISharedState<T, E, N>) => void;
      onDrag?: (state: ISharedState<T, E, N>) => void;
      onDragCancel?: (...args: any) => void;
    },
  ): () => void; // make an element draggable, returns a function to destroy the draggable.
  init(): void; // lazy initialization (auto performed when makeDraggable is used)
  destroy(): void; // lazy destruction
  cancel(): void;

  dragProps?: T;
  dragged?: N;
  wasDetached: Boolean;
  history: ISharedState<T, E, N>["history"];

  on: PubSub<DnDPhases, (state: ISharedState<T, E, N>) => void>["on"]; // subscribe a listener to Dnd phase
  off: PubSub<DnDPhases, (state: ISharedState<T, E, N>) => void>["off"]; // unsubscribe a listener from Dnd phase

  // calculated shared state
  readonly state: ISharedState<T, E, N>;
}
```

`NOTE`: `dragPropsChange` is currently an experimental feature.

The interface does not depend on the browser API and can be implemented for other platform usage.

Thus, a vanila js implementation of a draggable Node might look like:

```js
const observer = HtmlDndObserver();
const draggable = document.getElementById(draggableId);
// attach to dragStart events (mousedown, touchstart) on the HTMLElement
const destroyDraggable = observer.makeDraggable(draggable, {
  dragProps,
  onDrag: ({ deltaX, deltaY }) => {
    draggable.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`;
  },
  onDrop: () => {
    draggable.style.transform = "initial";
  },
});
const droppable = document.getElementById(droppableId);
const onDrop = state => {
  if (droppable.contains(state.current.target)) {
    console.log(`Dropped ${state.dragProps} on droppable`);
  }
};
const destroyOnDropListener = observer.on("drop", onDrop);

...
// finally, a cleanup example
destroyDraggable();
destroyOnDropListener(); // or observer.off("drop", onDrop);
observer.destroy();
```

Or, if you can't use hooks, but only a class is available for you

```jsx
import { withDndContext, DragContext } from "react-draggable-hoc";

const MyComponentWithDndContext = withDndContext(DragContext)(
  class MyComponent extends React.Component<{ dragProps: any }> {
    componentDidMount() {
      this.destroy = this.props.observer.makeDraggable(this.c, {
        dragProps: this.props.dragProps,
      });
    }

    componentWillUnmount() {
      this.destroy(); // this is actually not necessary, since the node will be removed anyway.
    }

    render() {
      <div ref={(c) => (this.c = c)} />;
    }
  },
);
```

---

## THIS IS THE TITLE PAGE OF THE DOCUMENTATION. FULL API DESCRIPTION WILL FOLLOW. THE DEMO MIGHT ALREADY CONTAIN SOME EXAMPLES.
