/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import ReactDOM from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

import "./index.css";
import { Jupyter } from "@datalayer/jupyter-react";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

const useLiveJupyterServer = process.env.JUPYTER_SERVER_HTTP_URL_DEV && process.env.JUPYTER_SERVER_WS_URL_DEV && process.env.JUPYTER_SERVER_TOKEN_DEV

if(useLiveJupyterServer){
  console.log("sufficient jupyter server params provided")
}

root.render(
  <Jupyter
  terminals={true}
  startDefaultKernel={true}
  jupyterServerHttpUrl={useLiveJupyterServer ? process.env.JUPYTER_SERVER_HTTP_URL_DEV : "http://localhost:8686/api/jupyter"}
  jupyterServerWsUrl={useLiveJupyterServer ? process.env.JUPYTER_SERVER_WS_URL_DEV : "ws://localhost:8686/api/jupyter"}
  jupyterToken={useLiveJupyterServer ? process.env.JUPYTER_SERVER_TOKEN_DEV : "60c1661cc408f978c309d04157af55c9588ff9557c9380e4fb50785750703da6"}
  >
    <App />
  </Jupyter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
