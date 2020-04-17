import * as React from "react";
import { NavLink, Redirect, Route, Switch } from "react-router-dom";

import Ghost from "./Ghost";
import SingleBin from "./SingleBin";
import MultiBin from "./MultiBin";

import "./App.css";

class App extends React.Component {
  public render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">react-draggable-hoc demo</h1>
          <menu>
            <NavLink to="/demo/singleBin">Single bin</NavLink>
            <NavLink to="/demo/multiBin">Multi bin</NavLink>
            <NavLink to="/demo/ghost">Complex</NavLink>
          </menu>
        </header>
        <section>
          <Switch>
            <Route path="/demo/singleBin" component={SingleBin} />
            <Route path="/demo/multiBin" component={MultiBin} />
            <Route path="/demo/ghost" component={Ghost} />
            <Redirect to="/demo/singleBin" />
          </Switch>
        </section>
      </div>
    );
  }
}

export default App;
