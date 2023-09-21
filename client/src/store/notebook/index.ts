/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ICellModel } from "@jupyterlab/cells";
import { IOutput, MultilineString, IError } from "@jupyterlab/nbformat";
import { EXPERIMENT_HISTORY, localStorageGet } from "../../local-storage";
import { Experiment } from "store/simulator";

export interface CellState {
  cell: ICellModel;
  code: MultilineString;
  output: IOutput[];
  hiddenCell: boolean;
  errorOutput?: IError;
  lintOutput?: string;
}
export type CellsStates = Record<string, CellState>;
export type UserInputCellsCode = Record<string, string[]>;
export enum KernelConnectionStatus {
  CONNECTING = "CONNECTING",
  UNKNOWN = "UNKOWN",
  FINE = "FINE",
}

interface State {
  cells: CellsStates;
  userInputCellsCode: UserInputCellsCode;
  setupCellOutput: number[];
  validationCellOutput: any[];
  experiment?: Experiment;
}

export interface NotebookState {
  isSaving: boolean;
  isEdited: boolean;
  isRunning: boolean;
  hasError: boolean;
  runCount: number;
  kernelStatus: KernelConnectionStatus;

  current: State | undefined;
  history: Record<string, State[]>;
}

const initialState: NotebookState = {
  isSaving: false,
  isEdited: false,
  isRunning: false,
  hasError: false,
  runCount: 0,
  kernelStatus: KernelConnectionStatus.CONNECTING,

  current: undefined,
  history: {},
};

export const notebookSlice = createSlice({
  name: "notebook",
  initialState,
  reducers: {
    loadCache: (state) => {
      state.history = localStorageGet(EXPERIMENT_HISTORY) as Record<
        string,
        State[]
      >;
    },
    setState: (
      state,
      action: PayloadAction<{
        isSaving?: boolean;
        isRunning?: boolean;
        isEdited?: boolean;
      }>
    ) => {
      // state.isSaving = action.payload;
    },
  },
});

export const {
  loadCache,
  // setSaving,
} = notebookSlice.actions;

export default notebookSlice.reducer;
