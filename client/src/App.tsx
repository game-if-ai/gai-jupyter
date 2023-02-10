/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  Jupyter,
  IpyWidgetsComponent,
  Notebook,
  CellSidebarDefault,
} from "@datalayer/jupyter-react";
import OutputsComponents from "./components/OutputsComponents";
import CellComponents from "./components/CellComponents";
import IPyWidgetsSimple from "./components/IPyWidgetsSimple";

import "./App.css";

function App(): JSX.Element {
  return (
    <>
      <Jupyter startDefaultKernel={true}>
        <IpyWidgetsComponent Widget={IPyWidgetsSimple}/>
        <OutputsComponents/>
        <CellComponents/>
        <Notebook path={"/ping.ipynb"} CellSidebar={CellSidebarDefault} />
      </Jupyter>
      <div className="App">
        <header className="App-header">
          <p>
            Edit <code>src/App.tsx</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    </>
  );
}

export default App;
