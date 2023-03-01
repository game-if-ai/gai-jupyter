/* eslint-disable */
/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { selectNotebookModel } from "@datalayer/jupyter-react";
import { useEffect, useState } from "react";
import { IOutput } from "@jupyterlab/nbformat";
import { INotebookModel } from "@jupyterlab/notebook";
import { ICellModel } from "@jupyterlab/cells";

import { GaiCellTypes, NOTEBOOK_UID } from "../local-constants";
import { FruitClassifierOutput } from "../games/fruit-picker/classifier";

export function useWithCellOutputs() {
  const activeNotebookModel = selectNotebookModel(NOTEBOOK_UID);
  activeNotebookModel?.model?.stateChanged.connect((changedModel) => {
    console.log(changedModel.cells);
  });

  const [fruitEvaluationOutput, setFruitEvaluationOutput] = useState<
    FruitClassifierOutput[][]
  >([]);
  const [notebookConnectionSetup, setNotebookConnectionSetup] = useState(false);

  function extractFruitClassifierOutputFromCell(
    cell: ICellModel
  ): FruitClassifierOutput[][] {
    const cellData = cell.toJSON();
    const cellOutput = (cellData.outputs as IOutput[])[0] as IOutput;
    const fruitClassifierData: FruitClassifierOutput[][] = JSON.parse(
      (cellOutput?.text as string) || "{}"
    );
    return fruitClassifierData;
  }

  function extractEvaluationOutput(activeNotebookModel: INotebookModel) {
    const notebookCells = activeNotebookModel.cells;
    if (!notebookCells) {
      return;
    }
    for (let i = 0; i < notebookCells.length; i++) {
      const cellData = notebookCells.get(i);
      const isEvaluationCell =
        cellData.getMetadata("gai_cell_type") === GaiCellTypes.EVALUATION;
      if (isEvaluationCell) {
        setFruitEvaluationOutput(
          extractFruitClassifierOutputFromCell(cellData)
        );
        cellData.stateChanged.connect((changedCell) => {
          setFruitEvaluationOutput(
            extractFruitClassifierOutputFromCell(changedCell)
          );
          console.log("evaluation cell changed");
        });
      }
    }
  }

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

  return {
    fruitEvaluationOutput,
  };
}
