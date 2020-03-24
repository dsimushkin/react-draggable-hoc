import "raf/polyfill";

import * as React from "react";
import * as ReactDOM from "react-dom";
import { HashRouter } from "react-router-dom";

import App from "./App";
import "./index.css";
import { unregister } from "./registerServiceWorker";

ReactDOM.render(
  <HashRouter>
    <App />
  </HashRouter>,
  document.getElementById("root"),
);
unregister();
