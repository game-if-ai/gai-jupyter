/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import React, { useEffect, useState } from "react";
import { Notebook, selectNotebook } from "@datalayer/jupyter-react";
import { INotebookContent } from "@jupyterlab/nbformat";
import { TextField, Button } from "@mui/material";
import { Send } from "@mui/icons-material";

import { Game } from "../games";
import { useWithNotebookModifications } from "../hooks/use-with-notebook-modifications";
import { GaiCellTypes, NOTEBOOK_UID } from "../local-constants";

function NotebookComponent(props: {
  game: Game;
  simulate: () => void;
}): JSX.Element {
  const [numSimulations, setNumSimulations] = useState<number>(5);
  const [init, setInit] = useState<boolean>(false);
  const notebook = selectNotebook(NOTEBOOK_UID);
  useWithNotebookModifications({ greyOutUneditableBlocks: true });

  useEffect(() => {
    if (init || !notebook || !notebook.model || !notebook.adapter) {
      return;
    }
    setInit(true);
    const source = notebook.model.toJSON() as INotebookContent;
    for (let c = 0; c < notebook.model.cells.length; c++) {
      const cellModel = notebook.model.cells.get(c);
      if (
        cellModel.getMetadata("gai_cell_type") === GaiCellTypes.INPUT &&
        props.game.notebookInit
      ) {
        source.cells[c].source = source.cells[c].source.concat(
          ...props.game.notebookInit.map((s) => `\n${s}`)
        );
      }
      if (
        cellModel.getMetadata("gai_cell_type") === GaiCellTypes.EVALUATION &&
        props.game.notebookStartingCode
      ) {
        source.cells[c].source = source.cells[c].source.concat(
          ...props.game.notebookStartingCode.map((s) => `\n${s}`)
        );
      }
    }
    notebook.adapter.setNotebookModel(source);
  }, [notebook, notebook?.model, notebook?.adapter]);

  function simulate(): void {
    if (!notebook || !notebook.model || !notebook.adapter) {
      return;
    }
    props.game.simulator.simulate(numSimulations, notebook, props.simulate);
  }

  return (
    <div style={{ width: "100%", alignItems: "center" }}>
      <TextField
        variant="outlined"
        label="Number of Simulations"
        value={numSimulations}
        onChange={(e) => setNumSimulations(Number(e.target.value) || 0)}
        inputProps={{ inputMode: "numeric", pattern: "[0-9]+" }}
        InputLabelProps={{ shrink: true }}
      />
      <Button endIcon={<Send />} onClick={simulate}>
        Run
      </Button>
      <div
        id="jupyter-notebook-container"
        style={{ width: "100%", alignItems: "left", textAlign: "left" }}
      >
        <Notebook path={"/test2.ipynb"} uid={NOTEBOOK_UID} />
      </div>
    </div>
  );
}

export default NotebookComponent;
