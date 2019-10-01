import * as React from "react";
import { NavLink, Redirect, Route, Switch } from "react-router-dom";

import Ghost from "./Ghost";
import Simple from "./Simple";

import "./App.css";

class App extends React.Component {
  public render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">react-draggable-hoc demo</h1>
          <menu>
            <NavLink to="/demo/ghost">Complex</NavLink>
            <NavLink to="/demo/simple">Simple</NavLink>
          </menu>
        </header>
        <section>
          <Switch>
            <Route path="/demo/ghost" component={Ghost} />
            <Route path="/demo/simple" component={Simple} />
            <Redirect to="/demo/simple" />
          </Switch>
        </section>
      </div>
    );
  }
}

export default App;
