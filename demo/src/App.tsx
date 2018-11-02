import * as React from 'react';
import { GhostExample } from './Ghost';
import { SimpleExample } from './Simple';

import './App.css';

class App extends React.Component {
  public render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">react-draggable-hoc demo</h1>
        </header>
        <p>
          Scrollable container, <br />
          draggable and droppable elements <br />
          with a ghost stuck to row bottom <br />
          and effects on drag over and drag start
        </p>
        <GhostExample />
        <p className="App-intro">
          Simple Draggable
        </p>
        <SimpleExample />
      </div>
    );
  }
}

export default App;
