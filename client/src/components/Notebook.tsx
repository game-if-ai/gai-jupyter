/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
/* eslint-disable */

import React, { useEffect } from "react";
import { Notebook, selectNotebook } from "@datalayer/jupyter-react";
import { Button } from "@mui/material";

import { Game } from "../games";
import { useWithNotebookModifications } from "../hooks/use-with-notebook-modifications";
import { useWithCellOutputs } from "../hooks/use-with-cell-outputs";
import { Experiment, Simulation } from "../games/simulator";
import { NOTEBOOK_UID } from "../local-constants";

function NotebookComponent(props: {
  game: Game;
  curExperiment: Experiment<Simulation> | undefined;
  setExperiment: (e: number) => void;
  viewSummary: () => void;
  runSimulation: (i: number) => void;
}): JSX.Element {
  const { curExperiment } = props;
  const { evaluationOutput, evaluationInput, evaluationCode } =
    useWithCellOutputs();
  useWithNotebookModifications({ greyOutUneditableBlocks: true });
  const notebook = selectNotebook(NOTEBOOK_UID);

  useEffect(() => {
    if (evaluationOutput && evaluationOutput.length) {
      props.game.simulator.simulate(
        evaluationOutput,
        evaluationInput[0],
        evaluationInput[1],
        evaluationCode,
        notebook
      );
      props.setExperiment(props.game.simulator.experiments.length - 1);
    }
  }, [evaluationOutput]);

  function simulate(): void {
    if (!notebook || !notebook.model || !notebook.adapter) {
      return;
    }
    notebook.adapter.commands.execute("notebook:run-all");
  }

  function toSimulation(): void {
    props.runSimulation(0);
  }

  function toSummary(): void {
    props.viewSummary();
  }

  return (
    <div style={{ width: "100%", alignItems: "center" }}>
      <div
        id="jupyter-notebook-container"
        style={{
          width: "100%",
          height: "100%",
          alignItems: "left",
          textAlign: "left",
        }}
      >
        <Notebook
          model={
            curExperiment?.notebookContent
              ? curExperiment.notebookContent
              : undefined
          }
          path={
            curExperiment?.notebookContent
              ? undefined
              : `${props.game.id}/test.ipynb`
          }
          uid={NOTEBOOK_UID}
        />
      </div>
      <Button onClick={simulate}>Run</Button>
      <Button
        onClick={toSimulation}
        disabled={
          !evaluationOutput.length &&
          props.game.simulator.experiments.length == 0
        }
      >
        View Simulations
      </Button>
      <Button
        disabled={
          !evaluationOutput.length &&
          props.game.simulator.experiments.length == 0
        }
        onClick={toSummary}
      >
        View Results Summary
      </Button>
    </div>
  );
}

export default NotebookComponent;
