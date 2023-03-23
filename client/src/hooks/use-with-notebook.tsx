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
  ICell,
  MultilineString,
} from "@jupyterlab/nbformat";
import { ICellModel } from "@jupyterlab/cells";

import { GaiCellTypes, NOTEBOOK_UID } from "../local-constants";
import {
  extractInputFromCell,
  extractOutputFromCell,
  extractCellCode,
} from "../utils";

export interface CellState {
  cell: ICellModel;
  code: MultilineString;
  output: IOutput[];
  lintOutput?: string;
  errorOutput?: IOutput;
}

export type UserInputCellsCode = Record<string, string[]>;

export function useWithCellOutputs() {
  const [userInputCellsCode, setUserInputCellsCode] =
    useState<UserInputCellsCode>({});
  const [evaluationInput, setEvaluationInput] = useState<number[]>([]);
  const [evaluationOutput, setEvaluationOutput] = useState<any[][]>([]);
  const [cells, setCells] = useState<Record<string, CellState>>({});
  const [notebookConnected, setNotebookConnected] = useState(false);
  const [isEdited, setIsEdited] = useState<boolean>(false);

  const notebook = selectNotebook(NOTEBOOK_UID);
  const activeNotebookModel = selectNotebookModel(NOTEBOOK_UID);
  const lintNotebook = selectNotebook(`${NOTEBOOK_UID}-lint`);
  const [lintModel, setLintModel] = useState<INotebookContent>();

  useEffect(() => {
    if (
      !activeNotebookModel ||
      !activeNotebookModel.model ||
      !activeNotebookModel.model.cells ||
      notebookConnected
    ) {
      return;
    }
    connect(activeNotebookModel.model);
  }, [activeNotebookModel]);

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
        const type = changedCell.getMetadata("gai_cell_type") as string;
        cells[type] = {
          cell: changedCell,
          code: changedCell.toJSON().source,
          output: changedCell.toJSON().outputs as IOutput[],
        };
        setCells({ ...cells });
        if (type === GaiCellTypes.INPUT) {
          setEvaluationInput(extractInputFromCell(changedCell));
        }
        if (type === GaiCellTypes.OUTPUT) {
          setEvaluationOutput(extractOutputFromCell(changedCell));
        }
      });
    }
    extractAndSetEvaluationCellCode(activeNotebookModel.cells);
    activeNotebookModel.contentChanged.connect((changedNotebook) => {
      extractAndSetEvaluationCellCode(changedNotebook.cells);
    });
    setCells(cs);
    setIsEdited(false);
    setNotebookConnected(true);
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

  function run(): void {
    if (!notebook || !notebook.model || !notebook.adapter) {
      return;
    }
    notebook.adapter.commands.execute("notebook:run-all");
  }

  function clearOutputs(): void {
    setEvaluationInput([]);
    setEvaluationOutput([]);
  }

  function editCode(cell: string, code: string): void {
    cells[cell].code = code;
    setCells({ ...cells });
    checkFormatAndErrors(cells);
    for (const c of Object.values(cells)) {
      if (c.cell.toJSON().source !== c.code) {
        setIsEdited(true);
        return;
      }
    }
    setIsEdited(false);
  }

  function undoCode(): void {
    for (const [type, cell] of Object.entries(cells)) {
      cells[type].code = cell.cell.toJSON().source;
    }
    setIsEdited(false);
    setCells({ ...cells });
    checkFormatAndErrors(cells);
  }

  function saveCode(): void {
    if (!notebook || !notebook.model || !notebook.adapter || !isEdited) {
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

  function checkFormatAndErrors(cells: Record<string, CellState>): void {
    if (!notebook || !notebook.model || !notebook.model.cells) {
      return;
    }
    const source = notebook.model.toJSON() as INotebookContent;
    const newCells = source.cells.reduce(
      (acc: ICell[], cur: ICell, i: number) => {
        const cell = notebook!.model!.cells.get(i);
        const cellType = cell.getMetadata("gai_cell_type") as string;
        const lintCell: ICell = {
          ...cur,
          source: `%%pycodestyle\n${cells[cellType].code}`,
          metadata: { ...cell.metadata, gai_lint_type: "lint" },
        };
        const outputCell: ICell = {
          ...cur,
          source: cells[cellType].code,
          metadata: { ...cell.metadata, gai_lint_type: "error" },
        };
        acc.push(outputCell);
        acc.push(lintCell);
        return acc;
      },
      []
    );
    setLintModel({
      ...source,
      cells: newCells,
    });
  }

  useEffect(() => {
    for (const cell of lintNotebook?.model?.cells || []) {
      cell.stateChanged.connect((changedCell) => {
        const output = changedCell.toJSON().outputs as IOutput[];
        const cellType = changedCell.getMetadata("gai_cell_type") as string;
        const outputType = changedCell.getMetadata("gai_lint_type") as string;
        if (outputType === "lint") {
          cells[cellType].lintOutput = output[0]?.text as string;
        }
        if (outputType === "error") {
          if (output[0]?.output_type === "error") {
            cells[cellType].errorOutput = output[0];
          } else {
            cells[cellType].errorOutput = undefined;
          }
        }
        setCells({ ...cells });
      });
    }
    lintNotebook?.adapter?.commands.execute("notebook:run-all");
  }, [lintModel]);

  return {
    cells,
    isEdited,
    evaluationInput,
    evaluationOutput,
    run,
    clearOutputs,
    editCode,
    undoCode,
    saveCode,
    userInputCellsCode,
    lintModel,
  };
}
