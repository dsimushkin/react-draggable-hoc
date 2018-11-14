# React Draggable Higher Order Component

A set of react Higher Order Components used to gain full control on dragging and dropping HTML nodes. Supports touch and mouse events. Prevents from scrolling only on drag.

## [DEMO](https://codesandbox.io/s/github/dsimushkin/react-draggable-hoc/tree/master/demo)

---

## Basic usage

First you need to create a context and at the same time a container, inside which the draggables can be moved. To do this just wrap any other component with _DragDropContainer_.

```jsx
import { DragDropContainer } from 'react-draggable-hoc';

<DragDropContainer>
    <CustomComponent />
</DragDropContainer>
```

Then use _draggable_ HOC to inject props into any component that should be dragged. 
```jsx
import { draggable } from 'react-draggable-hoc';

const SimpleDraggable = draggable(({value, x, y, isDragged}) => (
    <div style={{transform: isDragged ? `translate(${x}px, ${y}px)`: undefined}}>
        I'm draggable
    </div>
));
```
NOTICE: text cannot be draggable, use span/div or any other html tag.

Now you can use this component anywhere inside DragDropContainer providing dragProps as prop.

```jsx
<SimpleDraggable dragProps={value: "Hello"}>
```

To mark a region of a _draggable component_ to be draggable (or otherwise) use _DraggableArea_ along with _draggable_ prop

The following example will create a simple draggable target with a draggable handle

```jsx
import { draggable, DraggableArea } from 'react-draggable-hoc';

const SimpleDraggable = draggable(({value, x, y, isDragged}) => (
    <div style={{
        padding: 10,
        transform: isDragged ? `translate(${x}px, ${y}px)`: undefined
    }}>
        <DraggableArea draggable={true}>
            <span>I'm draggable</span>
        </DraggableArea>
    </div>
));

...
    <SimpleDraggable draggable={false} />
...
```

---

To create a drop target use Droppable Component with onDrag and onDrop props:
```jsx
class DroppableWithState extends React.Component {
    public state = {
        isHovered: false,
        dragProps: undefined
    }

    public onDrop = ({dragProps} : IDroppableProps) => {
        console.log(`Drop ${JSON.stringify(dragProps)}`);
        this.setState({isHovered: false});
    }

    public onDrag = ({isHovered, dragProps} : IDroppableProps) => {
        this.setState({isHovered, dragProps});
    }

    public render() {
        const {isHovered} = this.state;

        return (
            <Droppable
                onDrop={this.onDrop}
                onDrag={this.onDrag}
            >
                <div
                style={{
                    backgroundColor: isHovered ? 'rgba(0, 130, 20, 0.2)' : undefined,
                }}
                    Drop target
                >
                </div>
            </Droppable>
        )
    }
}
```
---
## API

Full api description will follow.