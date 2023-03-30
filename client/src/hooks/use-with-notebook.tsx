/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
/* eslint-disable */

import { useEffect, useState } from "react";
import { selectNotebook, selectNotebookModel } from "@datalayer/jupyter-react";
import { CellList } from "@jupyterlab/notebook/lib/celllist";
import { ICellModel } from "@jupyterlab/cells";
import { INotebookModel } from "@jupyterlab/notebook";
import {
  INotebookContent,
  IOutput,
  MultilineString,
  isError,
  IError,
} from "@jupyterlab/nbformat";

import { Experiment, Simulation } from "../games/simulator";
import { GaiCellTypes, NOTEBOOK_UID } from "../local-constants";
import { useInterval } from "./use-interval";
import {
  extractSetupCellOutput,
  extractValidationCellOutput,
  extractCellCode,
} from "../utils";

export interface CellState {
  cell: ICellModel;
  code: MultilineString;
  output: IOutput[];
  errorOutput?: IOutput;
}

export type CellsStates = Record<string, CellState>;

export type UserInputCellsCode = Record<string, string[]>;

export function useWithNotebook() {
  const [setupCellOutput, setSetupCellOutput] = useState<number[]>([]);
  const [outputCellOutput, setValidationCellOutput] = useState<any[][]>([]);
  const [cells, setCells] = useState<CellsStates>({});
  const [userInputCellsCode, setUserInputCellsCode] =
    useState<UserInputCellsCode>({});

  const [curExperiment, setCurExperiment] = useState<INotebookContent>();
  const [notebookConnected, setNotebookConnected] = useState(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveTimeout, setSaveTimeout] = useState<number>(0);
  const notebook = selectNotebook(NOTEBOOK_UID);
  const activeNotebookModel = selectNotebookModel(NOTEBOOK_UID);

  useEffect(() => {
    if (
      !activeNotebookModel?.model?.cells ||
      !notebook?.adapter?.commands ||
      notebookConnected
    ) {
      return;
    }
    if (
      !notebook.adapter.commands.listCommands().includes("notebook:run-all")
    ) {
      return;
    }
    connect(activeNotebookModel.model);
  }, [activeNotebookModel, notebook?.adapter?.commands]);

  useEffect(() => {
    for (const cell of Object.values(cells)) {
      if (cell.errorOutput) {
        setHasError(true);
        return;
      }
    }
    setHasError(false);
  }, [cells]);

  useEffect(() => {
    if (isSaving && setupCellOutput.length > 0) {
      setIsSaving(false);
    }
  }, [setupCellOutput]);

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
        const firstOutput = output[0];
        cells[cellType] = {
          cell: changedCell,
          code: changedCell.toJSON().source,
          output: output,
          errorOutput: isError(firstOutput) ? firstOutput : undefined,
        };
        if (cellType === GaiCellTypes.SETUP) {
          setSetupCellOutput(extractSetupCellOutput(changedCell));
        }
        if (cellType === GaiCellTypes.VALIDATION) {
          setValidationCellOutput(extractValidationCellOutput(changedCell));
        }
        setCells({ ...cells });
      });
    }
    extractAndSetModelCellCode(activeNotebookModel.cells);
    activeNotebookModel.contentChanged.connect((changedNotebook) => {
      extractAndSetModelCellCode(changedNotebook.cells);
    });
    setCells(cs);
    setNotebookConnected(true);
    if (!curExperiment) {
      setCurExperiment(notebook?.model?.toJSON() as INotebookContent);
    }
    notebook?.adapter?.commands.execute("notebook:run-all");
  }

  function extractAndSetModelCellCode(notebookCells: CellList) {
    let evalCellCount = 0;
    for (let i = 0; i < notebookCells.length; i++) {
      const cell = notebookCells.get(i);
      const cellSource = extractCellCode(cell);
      const cellType = cell.getMetadata("gai_cell_type");
      if (cellType === GaiCellTypes.MODEL) {
        setUserInputCellsCode((prevValue) => {
          return {
            ...prevValue,
            [`MODEL-CELL-${evalCellCount}`]: cellSource,
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
        setIsSaving(true);
        return;
      }
    }
  }

  function resetCode(experiment?: Experiment<Simulation>): void {
    if (!notebook?.adapter) {
      return;
    }
    setSetupCellOutput([]);
    setValidationCellOutput([]);
    if (experiment && experiment.notebookContent) {
      notebook.adapter.setNotebookModel(experiment.notebookContent);
      setIsSaving(true);
      setNotebookConnected(false);
    } else if (curExperiment) {
      notebook.adapter.setNotebookModel(curExperiment);
      setIsSaving(true);
      setNotebookConnected(false);
    }
  }

  function save(): void {
    if (!notebook || !notebook.model || !notebook.adapter) {
      return;
    }
    setSetupCellOutput([]);
    setValidationCellOutput([]);
    const source = notebook.model.toJSON() as INotebookContent;
    for (let i = 0; i < notebook.model.cells.length; i++) {
      const cell = notebook.model.cells.get(i);
      const cellType = cell.getMetadata("gai_cell_type") as string;
      if (cell.getMetadata("contenteditable") !== false) {
        source.cells[i].source = cells[cellType].code;
      }
    }
    notebook.adapter.setNotebookModel(source);
    setNotebookConnected(false);
  }

  return {
    cells,
    setupCellOutput,
    outputCellOutput,
    userInputCellsCode,
    hasError,
    isSaving,
    editCode,
    resetCode,
  };
}
