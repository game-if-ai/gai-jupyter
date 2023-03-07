/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
/* eslint-disable */

import { useEffect, useState } from "react";
import { selectNotebook, selectNotebookModel } from "@datalayer/jupyter-react";
import { INotebookModel } from "@jupyterlab/notebook";
import {
  INotebookContent,
  IOutput,
  MultilineString,
} from "@jupyterlab/nbformat";
import { ICellModel } from "@jupyterlab/cells";

import { GaiCellTypes, NOTEBOOK_UID } from "../local-constants";
import { extractInputFromCell, extractOutputFromCell } from "../utils";

interface CellState {
  cell: ICellModel;
  output: IOutput[];
}

export function useWithCellOutputs() {
  const [evaluationInput, setEvaluationInput] = useState<number[]>([0, 0]);
  const [evaluationOutput, setEvaluationOutput] = useState<any[][]>([]);
  const [evaluationCode, setEvaluationCode] = useState<MultilineString>("");
  const [notebookConnected, setNotebookConnected] = useState(false);
  const [cells, setCells] = useState<Record<string, CellState>>({});
  const [curCell, setCurCell] = useState<string>("");
  const [code, setCode] = useState<MultilineString>();

  const notebook = selectNotebook(NOTEBOOK_UID);
  const activeNotebookModel = selectNotebookModel(NOTEBOOK_UID);
  const isCodeEdited = `${code}` !== `${evaluationCode}`;

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
      const cellType = cellData.getMetadata("gai_cell_type");
      cs[cellType as string] = {
        cell: cellData,
        output: [],
      };
      cellData.stateChanged.connect((changedCell) => {
        const type = changedCell.getMetadata("gai_cell_type");
        cells[type as string] = {
          cell: changedCell,
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
      if (cellType === GaiCellTypes.EVALUATION) {
        setCode(cellData.toJSON().source);
        setEvaluationCode(cellData.toJSON().source);
        cellData.contentChanged.connect((changedCell) => {
          setEvaluationCode(changedCell.toJSON().source);
        });
      }
    }
    setCurCell(GaiCellTypes.EVALUATION);
    setCells(cs);
    setNotebookConnected(true);
  }

  function selectCell(cellType: GaiCellTypes): void {
    if (!notebook || !notebook.model || !notebook.adapter) {
      return;
    }
    setCurCell(cellType);
    const cell = cells[cellType].cell;
    const curIdx = Object.values(cells).findIndex(
      (c) =>
        c.cell.getMetadata("gai_cell_type") ===
        cell.getMetadata("gai_cell_type")
    );
    const cellIdx = Object.values(cells).findIndex(
      (c) => c.cell.getMetadata("gai_cell_type") === cellType
    );
    for (let i = curIdx; i !== cellIdx; i += curIdx > cellIdx ? -1 : 1) {
      if (cellIdx < i) {
        notebook.adapter.commands.execute("notebook-cells:select-above");
      } else {
        notebook.adapter.commands.execute("notebook-cells:select-below");
      }
    }
  }

  function run(): void {
    if (!notebook || !notebook.model || !notebook.adapter) {
      return;
    }
    // notebook.adapter.commands.execute("run-selected-codecell");
    notebook.adapter.commands.execute("notebook:run-all");
  }

  function editCode(code: string): void {
    setCode(code);
  }

  function saveCode(): void {
    if (!notebook || !notebook.model || !notebook.adapter || !code) {
      return;
    }
    setNotebookConnected(false);
    const source = notebook.model.toJSON() as INotebookContent;
    for (let i = 0; i < notebook.model.cells.length; i++) {
      const cell = notebook.model.cells.get(i);
      if (cell.getMetadata("gai_cell_type") === GaiCellTypes.EVALUATION) {
        source.cells[i].source = code;
      }
    }
    notebook.adapter.setNotebookModel(source);
  }

  function undoCode(): void {
    if (!isCodeEdited) {
      return;
    }
    setCode(evaluationCode);
  }

  return {
    cells,
    curCell,
    code,
    isCodeEdited,
    evaluationInput,
    evaluationOutput,
    evaluationCode,
    selectCell,
    run,
    editCode,
    saveCode,
    undoCode,
  };
}
