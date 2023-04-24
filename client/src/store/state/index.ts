/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Activity } from "../../games";
import { AllExperimentTypes } from "../../games/activity-types";

export enum STEP {
  PICK_GAME,
  NOTEBOOK,
  SIMULATION, // for current experiment
  SUMMARY, // for current experiment
  EXPERIMENTS, // experiment history
}

export interface State {
  step: STEP;
  activity: Activity | undefined;
  experiment: AllExperimentTypes | undefined;
  simulation: number;
  timesNotebookVisited: number;
}

const initialState: State = {
  step: STEP.PICK_GAME,
  activity: undefined,
  experiment: undefined,
  simulation: 0,
  timesNotebookVisited: 0,
};

export const stateSlice = createSlice({
  name: "state",
  initialState,
  reducers: {
    setStep: (state: any, action: PayloadAction<STEP>) => {
      state.step = action.payload;
      if (action.payload === STEP.NOTEBOOK) {
        state.timesNotebookVisited += 1;
      }
    },
    setActivity: (state: any, action: PayloadAction<Activity>) => {
      state.activity = action.payload;
    },
    setExperiment: (state: any, action: PayloadAction<AllExperimentTypes>) => {
      state.experiment = action.payload;
    },
    setSimulation: (state: any, action: PayloadAction<number>) => {
      state.simulation = action.payload;
    },
  },
});

export const { setStep, setActivity, setExperiment, setSimulation } =
  stateSlice.actions;

export default stateSlice.reducer;
