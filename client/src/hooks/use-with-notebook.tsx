/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
/* eslint-disable */

import { useEffect, useState } from "react";
import { selectNotebook, selectNotebookModel } from "@datalayer/jupyter-react";
import { INotebookModel } from "@jupyterlab/notebook";
import { CellList } from "@jupyterlab/notebook/lib/celllist";
import {
  INotebookContent,
  IOutput,
  MultilineString,
} from "@jupyterlab/nbformat";
import { ICellModel } from "@jupyterlab/cells";

import { GaiCellTypes, NOTEBOOK_UID } from "../local-constants";
import {
  extractInputFromCell,
  extractOutputFromCell,
  extractCellCode,
} from "../utils";
import { useInterval } from "./use-interval";

export interface CellState {
  cell: ICellModel;
  code: MultilineString;
  output: IOutput[];
  errorOutput?: IOutput;
}

export type UserInputCellsCode = Record<string, string[]>;

export function useWithNotebook() {
  const [evaluationInput, setEvaluationInput] = useState<number[]>([]);
  const [evaluationOutput, setEvaluationOutput] = useState<any[][]>([]);
  const [cells, setCells] = useState<Record<string, CellState>>({});
  const [userInputCellsCode, setUserInputCellsCode] =
    useState<UserInputCellsCode>({});

  const [notebookConnected, setNotebookConnected] = useState(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [saveTimeout, setSaveTimeout] = useState<number>(0);
  const notebook = selectNotebook(NOTEBOOK_UID);
  const activeNotebookModel = selectNotebookModel(NOTEBOOK_UID);

  useEffect(() => {
    if (!activeNotebookModel?.model?.cells || notebookConnected) {
      return;
    }
    connect(activeNotebookModel.model);
  }, [activeNotebookModel]);

  useEffect(() => {
    for (const cell of Object.values(cells)) {
      if (cell.errorOutput) {
        setHasError(true);
        return;
      }
    }
    setHasError(false);
  }, [cells]);

  useInterval(
    (isCancelled) => {
      if (isCancelled()) {
        return;
      }
      if (saveTimeout <= 1000) {
        save();
      }
      setSaveTimeout(saveTimeout - 1000);
    },
    saveTimeout > 0 ? 1000 : null
  );

  function connect(activeNotebookModel: INotebookModel) {
    const cs: Record<string, CellState> = {};
    const notebookCells = activeNotebookModel.cells;
    for (let i = 0; i < notebookCells.length; i++) {
      const cellData = notebookCells.get(i);
      const cellType = cellData.getMetadata("gai_cell_type") as string;
      cs[cellType] = {
        cell: cellData,
        code: cellData.toJSON().source,
        output: [],
      };
      cellData.stateChanged.connect((changedCell) => {
        const cellType = changedCell.getMetadata("gai_cell_type") as string;
        const output = changedCell.toJSON().outputs as IOutput[];
        cells[cellType] = {
          cell: changedCell,
          code: changedCell.toJSON().source,
          output: output,
        };
        if (output[0]?.output_type === "error") {
          cells[cellType].errorOutput = output[0];
        }
        if (cellType === GaiCellTypes.INPUT) {
          setEvaluationInput(extractInputFromCell(changedCell));
        }
        if (cellType === GaiCellTypes.OUTPUT) {
          setEvaluationOutput(extractOutputFromCell(changedCell));
        }
        setCells({ ...cells });
      });
    }
    extractAndSetEvaluationCellCode(activeNotebookModel.cells);
    activeNotebookModel.contentChanged.connect((changedNotebook) => {
      extractAndSetEvaluationCellCode(changedNotebook.cells);
    });
    setCells(cs);
    setNotebookConnected(true);
    notebook?.adapter?.commands.execute("notebook:run-all");
  }

  function extractAndSetEvaluationCellCode(notebookCells: CellList) {
    let evalCellCount = 0;
    for (let i = 0; i < notebookCells.length; i++) {
      const cell = notebookCells.get(i);
      const cellSource = extractCellCode(cell);
      const cellType = cell.getMetadata("gai_cell_type");
      if (cellType === GaiCellTypes.EVALUATION) {
        setUserInputCellsCode((prevValue) => {
          return {
            ...prevValue,
            [`EVALUATION-CELL-${evalCellCount}`]: cellSource,
          };
        });
        evalCellCount++;
      }
    }
  }

  function editCode(cell: string, code: string): void {
    cells[cell].code = code;
    setCells({ ...cells });
    for (const c of Object.values(cells)) {
      if (c.cell.toJSON().source !== c.code) {
        setSaveTimeout(5000); // save if code is edited
        return;
      }
    }
  }

  function resetCode(): void {
    for (const [type, cell] of Object.entries(cells)) {
      cells[type].code = cell.cell.toJSON().source;
    }
    setCells({ ...cells });
    setSaveTimeout(5000);
  }

  function save(): void {
    if (!notebook || !notebook.model || !notebook.adapter) {
      return;
    }
    setNotebookConnected(false);
    const source = notebook.model.toJSON() as INotebookContent;
    for (let i = 0; i < notebook.model.cells.length; i++) {
      const cell = notebook.model.cells.get(i);
      const cellType = cell.getMetadata("gai_cell_type") as string;
      if (cell.getMetadata("contenteditable") !== false) {
        source.cells[i].source = cells[cellType].code;
      }
    }
    notebook.adapter.setNotebookModel(source);
  }

  return {
    cells,
    evaluationInput,
    evaluationOutput,
    userInputCellsCode,
    hasError,
    editCode,
    resetCode,
  };
}
