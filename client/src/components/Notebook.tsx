/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import React, { useState } from "react";
import { Notebook } from "@datalayer/jupyter-react";

import { TextField, Button } from "@mui/material";
import { Send } from "@mui/icons-material";

import { Classifier } from "../classifier";
import { Game } from "../games";

import { useWithNotebookModifications } from "../hooks/use-with-notebook-modifications";
import { useWithCellOutputs } from "../hooks/use-with-cell-outputs";
import { NOTEBOOK_UID } from "../local-constants";

function NotebookComponent(props: {
  game: Game;
  classifier?: Classifier;
  simulate: () => void;
  viewSummary: () => void;
  runSimulation: (i: number) => void;
}): JSX.Element {
  useWithNotebookModifications({ greyOutUneditableBlocks: true });
  const { fruitEvaluationOutput } = useWithCellOutputs();

  function simulate(): void {
    props.game.simulator.simulate(
      fruitEvaluationOutput.length,
      props.game.classifier,
      fruitEvaluationOutput
    );
    props.runSimulation(0);
  }

  function summary(): void {
    props.game.simulator.simulate(
      fruitEvaluationOutput.length,
      props.game.classifier,
      fruitEvaluationOutput
    );
    props.viewSummary();
  }

  return (
    <div style={{ width: "100%", alignItems: "center" }}>
      <div
        id="jupyter-notebook-container"
        style={{
          width: "100%",
          alignItems: "left",
          textAlign: "left",
          height: "100%",
        }}
      >
        <Notebook path={"/test.ipynb"} uid={NOTEBOOK_UID} />
      </div>
      <Button onClick={simulate} disabled={!fruitEvaluationOutput.length}>
        Run Simulation
      </Button>
      <Button disabled={!fruitEvaluationOutput.length} onClick={summary}>
        View Results Summary
      </Button>
    </div>
  );
}

export default NotebookComponent;
