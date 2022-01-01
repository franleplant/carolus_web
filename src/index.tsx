import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import Providers from "components/Provider";
import reportWebVitals from "./reportWebVitals";

function AppWrapper() {
  return (
    <Providers>
      <App />
    </Providers>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
