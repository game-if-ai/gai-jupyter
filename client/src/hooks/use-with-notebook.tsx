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

export interface CellState {
  cell: ICellModel;
  code: MultilineString;
  output: IOutput[];
}

export function useWithCellOutputs() {
  const [evaluationInput, setEvaluationInput] = useState<number[]>([]);
  const [evaluationOutput, setEvaluationOutput] = useState<any[][]>([]);
  const [cells, setCells] = useState<Record<string, CellState>>({});
  const [notebookConnected, setNotebookConnected] = useState(false);
  const [isEdited, setIsEdited] = useState<boolean>(false);
  const notebook = selectNotebook(NOTEBOOK_UID);
  const activeNotebookModel = selectNotebookModel(NOTEBOOK_UID);

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
    setCells(cs);
    setIsEdited(false);
    setNotebookConnected(true);
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

  function editCell(cell: string, code: string): void {
    cells[cell].code = code;
    let edited = false;
    for (const c of Object.values(cells)) {
      if (c.cell.toJSON().source !== c.code) {
        edited = true;
        break;
      }
    }
    setIsEdited(edited);
    setCells({ ...cells });
  }

  function undoCells(): void {
    for (const [type, cell] of Object.entries(cells)) {
      cells[type].code = cell.cell.toJSON().source;
    }
    setIsEdited(false);
    setCells({ ...cells });
  }

  function saveCells(): void {
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

  function formatCells(): void {
    // const f = prettier.format("foo ( );", {
    //   parser: "babel",
    //   plugins: [parser],
    // });
    // console.log('test format ', f)
  }

  return {
    cells,
    isEdited,
    evaluationInput,
    evaluationOutput,
    run,
    clearOutputs,
    editCell,
    undoCells,
    saveCells,
    formatCells,
  };
}
