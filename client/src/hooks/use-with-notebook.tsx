/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
/* eslint-disable */

import {
  INotebookState,
  selectNotebook,
  selectNotebookModel,
} from "@datalayer/jupyter-react";
import { INotebookModel } from "@jupyterlab/notebook";
import { CellList } from "@jupyterlab/notebook/lib/celllist";
import { ICellModel } from "@jupyterlab/cells";
import {
  INotebookContent,
  IOutput,
  MultilineString,
  isError,
  IError,
} from "@jupyterlab/nbformat";
import { useEffect, useState } from "react";

import { KernelConnectionStatus } from "../components/Notebook";
import { GaiCellTypes, NOTEBOOK_UID } from "../local-constants";
import { useAppDispatch, useAppSelector } from "../store";
import { Activity, Experiment } from "../store/simulator";
import {
  setIsRunning,
  setIsSaving,
  updateLocalNotebook,
} from "../store/notebook";
import { extractCellCode, formatCellCode, isValidJSON } from "../utils";
import {
  requestCodeExecution,
  pollCodeExecutionStatus,
  SUCCESS_STATUS,
} from "../api";

export interface CellState {
  cell: ICellModel;
  code: MultilineString;
  output: IOutput[];
  hiddenCell: boolean;
  errorOutput?: IError;
  lintOutput?: string;
}

export interface ExecutionResult {
  notebook: INotebookState;
  result?: string[];
  console: string | undefined;
  success: boolean;
  error?: string;
}

export type CellsStates = Record<string, CellState>;

export type UserInputCellsCode = Record<string, string[]>;

export function useWithNotebook(props: {
  curActivity: Activity;
  curExperiment?: Experiment;
  kernelStatus: KernelConnectionStatus;
}) {
  const { curActivity, curExperiment, kernelStatus } = props;
  const dispatch = useAppDispatch();
  const { isSaving } = useAppSelector((s) => s.notebookState);
  const [userInputCellsCode, setUserInputCellsCode] =
    useState<UserInputCellsCode>({});
  const [loadedWithExperiment] = useState(Boolean(curExperiment)); //only evaluates when component first loads
  const [curExperimentLoaded, setCurExperimentLoaded] = useState(false);
  const [initialConnectionMade, setInitialConnectionMade] = useState(false);
  const [cells, setCells] = useState<CellsStates>({});
  const [notebookConnected, setNotebookConnected] = useState(false);
  const [error, setError] = useState<string>("");
  const [isEdited, setIsEdited] = useState<boolean>(false);
  const [notebookRunCount, setNotebookRuns] = useState(0);
  const [lastExecutionResult, setLastExecutionResult] =
    useState<ExecutionResult>();
  const _setupCellOutput =
    lastExecutionResult?.result && lastExecutionResult.result.length >= 1
      ? lastExecutionResult.result[0]
      : "";
  const setupCellOutput = isValidJSON(_setupCellOutput)
    ? JSON.parse(_setupCellOutput)
    : _setupCellOutput;
  const _validationCellOutput =
    lastExecutionResult?.result && lastExecutionResult.result.length >= 2
      ? lastExecutionResult.result[1]
      : [];
  const validationCellOutput: string[] =
    isValidJSON(_validationCellOutput) &&
    typeof _validationCellOutput === "string"
      ? JSON.parse(_validationCellOutput)
      : _validationCellOutput;
  const _modelCellOutput = lastExecutionResult?.console
    ? lastExecutionResult.console
    : [];
  const modelCellOutput: string[] =
    isValidJSON(_modelCellOutput) && typeof _modelCellOutput === "string"
      ? JSON.parse(_modelCellOutput)
      : _modelCellOutput;

  const notebook = selectNotebook(NOTEBOOK_UID);
  const activeNotebookModel = selectNotebookModel(NOTEBOOK_UID);

  useEffect(() => {
    if (
      curExperimentLoaded ||
      kernelStatus !== KernelConnectionStatus.FINE ||
      !notebook ||
      !notebook.adapter ||
      !curExperiment ||
      !curExperiment.notebookContent
    ) {
      return;
    }
    if (loadedWithExperiment) {
      notebook.adapter.setNotebookModel(curExperiment.notebookContent);
      setNotebookConnected(false);
      setCurExperimentLoaded(true);
    }
  }, [loadedWithExperiment, notebook, kernelStatus]);

  useEffect(() => {
    if (
      !activeNotebookModel?.model?.cells ||
      !notebook?.adapter?.commands ||
      notebookConnected ||
      (loadedWithExperiment && !curExperimentLoaded)
    ) {
      return;
    }
    connect(activeNotebookModel.model);
  }, [activeNotebookModel, notebook?.adapter?.commands]);

  function attachOutputsToCells(lastExecutionResult: ExecutionResult) {
    const setupCellOutput =
      lastExecutionResult?.result && lastExecutionResult.result.length >= 1
        ? lastExecutionResult.result[0]
        : [];
    const validationCellOutput =
      lastExecutionResult?.result && lastExecutionResult.result.length >= 2
        ? lastExecutionResult.result[1]
        : [];
    const modelCellOutput = lastExecutionResult?.console
      ? lastExecutionResult.console
      : "";
    const error = lastExecutionResult?.error;
    setCells((prevValue) => {
      const newCells = { ...prevValue };
      for (const cellId in newCells) {
        if (
          newCells[cellId].cell.getMetadata("gai_cell_type") ===
          GaiCellTypes.SETUP
        ) {
          newCells[cellId].output = setupCellOutput.length
            ? [
                {
                  output_type: "display_data",
                  name: "stdout",
                  text: setupCellOutput,
                },
              ]
            : [];
        }
        if (
          newCells[cellId].cell.getMetadata("gai_cell_type") ===
          GaiCellTypes.VALIDATION
        ) {
          newCells[cellId].output = validationCellOutput.length
            ? [
                {
                  output_type: "display_data",
                  name: "stdout",
                  text: validationCellOutput,
                },
              ]
            : [];
        }
        if (
          newCells[cellId].cell.getMetadata("gai_cell_type") ===
          GaiCellTypes.MODEL
        ) {
          if (error) {
            newCells[cellId].errorOutput = {
              ename: "Error",
              evalue: error,
              traceback: [],
              output_type: "error",
            };
          }
          newCells[cellId].output = [
            { output_type: "stream", name: "stdout", text: modelCellOutput },
          ];
        }
      }
      return newCells;
    });
  }

  function connect(activeNotebookModel: INotebookModel) {
    const cs: Record<string, CellState> = {};
    const notebookCells = activeNotebookModel.cells;
    for (let i = 0; i < notebookCells.length; i++) {
      const cellData = notebookCells.get(i);
      const cellId = cellData.id;
      const outputs = cellData.toJSON().outputs as IOutput[];
      cs[cellId] = {
        cell: cellData,
        code: cellData.toJSON().source,
        output: outputs || [],
        hiddenCell: cellData.getMetadata("hidden") || false,
      };
      cellData.stateChanged.connect((changedCell) => {
        const cellType = changedCell.getMetadata("gai_cell_type") as string;
        const outputs = changedCell.toJSON().outputs as IOutput[];
        if (cellType === GaiCellTypes.LINT) {
          if (outputs.length > 0) {
            const codeCellId = notebookCells.get(i - 1).id;
            setCells((prevValue) => {
              return {
                ...prevValue,
                [codeCellId]: {
                  ...prevValue[codeCellId],
                  lintOutput: outputs[0].text as string,
                },
              };
            });
          }
        }
        // Note: We no longer execute in jupyter labs, so no more listening to
        // if (cellType === GaiCellTypes.SETUP) {
        //   setSetupCellOutput(extractSetupCellOutput(changedCell));
        // }
        // if (cellType === GaiCellTypes.VALIDATION) {
        //   setValidationCellOutput(getValidationCellOutput(changedCell));
        // }
        setCells((prevValue) => {
          return {
            ...prevValue,
            [cellId]: {
              cell: changedCell,
              code: changedCell.toJSON().source,
              output: outputs,
              hiddenCell: changedCell.getMetadata("hidden") || false,
              errorOutput:
                outputs[0] && isError(outputs[0]) ? outputs[0] : undefined,
            },
          };
        });
      });
    }
    extractAndSetModelCellCode(activeNotebookModel.cells);
    activeNotebookModel.contentChanged.connect((changedNotebook) => {
      extractAndSetModelCellCode(changedNotebook.cells);
    });
    setCells(cs);
    setNotebookConnected(true);
    setInitialConnectionMade(true);
    setIsEdited(false);
    dispatch(setIsSaving(false));
  }

  async function runNotebook() {
    if (!notebook) {
      return;
    }
    setError("");
    dispatch(setIsRunning(true));
    let result: ExecutionResult = {
      console: "",
      result: [],
      notebook: notebook,
      success: false,
    };
    try {
      let code = "";
      const notebookCells = activeNotebookModel?.model?.cells;
      if (notebookCells) {
        for (let ii = 1; ii < notebookCells.length; ii++) {
          const currentCell = notebookCells.get(ii);
          code = code
            .concat(currentCell.toJSON().source.toString())
            .concat("\n");
        }
      }

      const holdingResponse = await requestCodeExecution(code, curActivity.id);
      const actualResponse = await pollCodeExecutionStatus(
        holdingResponse.statusUrl
      );
      if (actualResponse.state == SUCCESS_STATUS) {
        result = {
          notebook: notebook,
          result: actualResponse.result,
          console: actualResponse.console,
          success: true,
        };
      } else {
        setError(
          `An error occured: ${
            actualResponse.error ||
            actualResponse.message ||
            JSON.stringify(actualResponse.result)
          }`
        );
        result = {
          notebook: notebook,
          error: `An error occured: ${
            actualResponse.error ||
            actualResponse.message ||
            JSON.stringify(actualResponse.result)
          }`,
          console: actualResponse.message,
          success: false,
        };
      }
      attachOutputsToCells(result);
      setLastExecutionResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      dispatch(setIsRunning(false));
      setNotebookRuns((prevValue) => prevValue + 1);
      return result;
    }
  }

  function extractAndSetModelCellCode(
    notebookCells: CellList,
    cells?: Record<string, CellState>
  ) {
    let evalCellCount = 0;
    for (let i = 0; i < notebookCells.length; i++) {
      const cell = notebookCells.get(i);
      const cellSource = cells
        ? formatCellCode(cells[cell.id].code)
        : extractCellCode(cell);
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
    const notebookCells = activeNotebookModel?.model?.cells;
    if (!notebookCells) return;
    setCells((prevValue) => {
      prevValue[cell].code = code;
      if (prevValue[cell].cell.getMetadata("check_lint") === true) {
        const key = Object.keys(prevValue).findIndex((c) => c === cell);
        prevValue[
          Object.keys(prevValue)[key + 1]
        ].code = `%%pycodestyle\n${code}`;
      }
      for (const c of Object.values(prevValue)) {
        if (c.cell.toJSON().source !== c.code) {
          setIsEdited(true);
        }
      }
      extractAndSetModelCellCode(notebookCells, prevValue);
      return prevValue;
    });
  }

  function saveLocalChanges(): void {
    // save local changes temporarily
    if (notebook?.model) {
      const nbc = notebook.model.toJSON() as INotebookContent;
      for (const [i, cell] of Object.values(cells).entries()) {
        nbc.cells[i].source = cell.code;
      }
      dispatch(updateLocalNotebook({ id: curActivity.id, notebook: nbc }));
    }
  }

  function resetCode(
    experiment?: Experiment,
    localNotebook?: INotebookContent
  ): void {
    if (!notebook?.adapter) {
      return;
    }
    if (experiment && experiment.notebookContent) {
      notebook.adapter.setNotebookModel(experiment.notebookContent);
      setIsEdited(true);
      setNotebookConnected(false);
    } else if (curExperiment?.notebookContent) {
      notebook.adapter.setNotebookModel(curExperiment.notebookContent);
      setIsEdited(true);
      setNotebookConnected(false);
    } else if (localNotebook) {
      notebook.adapter.setNotebookModel(localNotebook);
      setIsEdited(true);
      setNotebookConnected(false);
    }
  }

  function saveNotebook(): void {
    if (isSaving || !notebook || !notebook.model || !notebook.adapter) {
      return;
    }
    dispatch(setIsSaving(true));
    const source = notebook.model.toJSON() as INotebookContent;
    for (let i = 0; i < notebook.model.cells.length; i++) {
      const cell = notebook.model.cells.get(i);
      const cellId = cell.id;
      if (cell.getMetadata("contenteditable") !== false) {
        source.cells[i].source = cells[cellId].code;
      }
    }
    notebook.adapter.setNotebookModel(source);
    setNotebookConnected(false);
  }

  return {
    cells,
    setupCellOutput,
    validationCellOutput,
    userInputCellsCode,
    modelCellOutput,
    error,
    isEdited,
    notebookRunCount,
    notebookInitialRunComplete: notebookRunCount > 0,
    saveNotebook,
    saveLocalChanges,
    runNotebook,
    editCode,
    resetCode,
    initialConnectionMade,
  };
}
