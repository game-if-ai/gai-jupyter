/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { INotebookContent } from "@jupyterlab/nbformat";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ActivityID } from "../simulator";
import {
  localStorageGet,
  localStorageStore,
  NOTEBOOK_HISTORY,
} from "../../local-storage";

export interface NotebookState {
  curCell: string;
  localNotebooks: Record<ActivityID, INotebookContent | undefined>;
}

const initialState: NotebookState = {
  curCell: "",
  localNotebooks: getNotebookHistory(),
};

function getNotebookHistory(): Record<
  ActivityID,
  INotebookContent | undefined
> {
  let notebooks = localStorageGet(NOTEBOOK_HISTORY) as Record<
    ActivityID,
    INotebookContent | undefined
  >;
  if (!notebooks) {
    notebooks = {
      cafe: undefined,
      fruitpicker: undefined,
      neural_machine_translation: undefined,
      planes: undefined,
    };
  }
  return notebooks;
}

export const notebookSlice = createSlice({
  name: "notebook",
  initialState,
  reducers: {
    setCurCell: (state, action: PayloadAction<string>) => {
      state.curCell = action.payload;
    },
    updateLocalNotebook: (
      state,
      action: PayloadAction<{
        id: ActivityID;
        notebook: INotebookContent | undefined;
      }>
    ) => {
      const { id, notebook } = action.payload;
      state.localNotebooks[id] = notebook;
      localStorageStore(NOTEBOOK_HISTORY, state.localNotebooks);
    },
  },
});

export const { setCurCell, updateLocalNotebook } = notebookSlice.actions;

export default notebookSlice.reducer;
