/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import React, { useState } from "react";
import {
  Jupyter,
  Notebook,
  CellSidebarDefault,
} from "@datalayer/jupyter-react";
import { ICodeCell, IMarkdownCell } from "@jupyterlab/nbformat/lib/index";
import { TextField, Button } from "@mui/material";
import { Send } from "@mui/icons-material";

import { Classifier } from "../classifier";
import { Game } from "../games";
import FruitClassifier from "../games/fruit-picker/classifier";

function NotebookComponent(props: {
  game: Game;
  classifier?: Classifier;
  simulate: (c: Classifier) => void;
}): JSX.Element {
  const [classifier, setClassifier] = useState<Classifier | undefined>(
    FruitClassifier
  );
  const [numSimulations, setNumSimulations] = useState<number>(5);

  function simulate(): void {
    if (!classifier) {
      return;
    }
    props.game.simulator.simulate(numSimulations, classifier);
    props.simulate(classifier);
  }

  return (
    <div style={{ alignItems: "center" }}>
      <TextField
        variant="outlined"
        label="Number of Simulations"
        value={numSimulations}
        onChange={(e) => setNumSimulations(Number(e.target.value) || 0)}
        inputProps={{ inputMode: "numeric", pattern: "[0-9]+" }}
        InputLabelProps={{ shrink: true }}
      />
      <Button disabled={!classifier} endIcon={<Send />} onClick={simulate}>
        Run
      </Button>
      <Jupyter terminals={true} startDefaultKernel={true}>
        <Notebook
          model={{
            cells: [
              {
                source: "x=2",
                cell_type: "code",
                metadata: {
                  trusted: true,
                  editable: false,
                  deletable: false,
                },
                outputs: [],
                execution_count: 0,
              } as ICodeCell,
              {
                source: "Markdown Cell Example",
                cell_type: "markdown",
              } as IMarkdownCell,
              {
                source: 'print("Hello, world!")',
                cell_type: "code",
              } as ICodeCell,
            ],
            metadata: {},
            nbformat_minor: 1,
            nbformat: 1,
          }}
          uid="123"
          CellSidebar={CellSidebarDefault}
        />
      </Jupyter>
    </div>
  );
}

export default NotebookComponent;
