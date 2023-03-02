/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
/* eslint-disable */

import { selectNotebookModel } from "@datalayer/jupyter-react";
import { useEffect, useState } from "react";
import { INotebookModel } from "@jupyterlab/notebook";

import { GaiCellTypes, NOTEBOOK_UID } from "../local-constants";
import { extractClassifierOutputFromCell } from "../utils";

export function useWithCellOutputs() {
  const [evaluationOutput, setEvaluationOutput] = useState<any[][]>([]);
  const [notebookConnectionSetup, setNotebookConnectionSetup] = useState(false);
  const activeNotebookModel = selectNotebookModel(NOTEBOOK_UID);

  useEffect(() => {
    if (
      !activeNotebookModel ||
      !activeNotebookModel.model ||
      notebookConnectionSetup
    ) {
      return;
    }
    setNotebookConnectionSetup(true);
    extractEvaluationOutput(activeNotebookModel.model);
  }, [activeNotebookModel, notebookConnectionSetup]);

  function reconnectCell(): void {
    setNotebookConnectionSetup(false);
  }

  function extractEvaluationOutput(activeNotebookModel: INotebookModel) {
    const notebookCells = activeNotebookModel.cells;
    if (!notebookCells) {
      return;
    }
    for (let i = 0; i < notebookCells.length; i++) {
      const cellData = notebookCells.get(i);
      const isEvaluationCell =
        cellData.getMetadata("gai_cell_type") === GaiCellTypes.OUTPUT;
      if (isEvaluationCell) {
        setEvaluationOutput(extractClassifierOutputFromCell(cellData));
        cellData.stateChanged.connect((changedCell) => {
          setEvaluationOutput(extractClassifierOutputFromCell(changedCell));
          console.log("output cell changed");
        });
      }
    }
  }

  return {
    evaluationOutput,
    reconnectCell,
  };
}
