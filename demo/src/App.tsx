import * as React from 'react';
import { GhostExample, GhostExampleTitle } from './Ghost';
import { SimpleExample, SimpleExampleTitle } from './Simple';

import './App.css';

class App extends React.Component {
  public render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">react-draggable-hoc demo</h1>
        </header>
        <GhostExampleTitle />
        <GhostExample />
        <SimpleExampleTitle />
        <SimpleExample />
      </div>
    );
  }
}

export default App;
