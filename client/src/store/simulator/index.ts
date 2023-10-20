/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { Completion } from "@codemirror/autocomplete";
import { INotebookState } from "@datalayer/jupyter-react";
import { ICellModel } from "@jupyterlab/cells";
import { INotebookContent } from "@jupyterlab/nbformat";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { CafeCodeInfo } from "games/cafe/hooks/use-with-cafe-code-examine";
import {
  CafeSimulationOutput,
  CafeSimulationsSummary,
} from "games/cafe/simulator";
import { FruitPickerCodeInfo } from "games/fruit-picker/hooks/use-with-fruit-picker-code-examine";
import {
  FruitSimulationOutput,
  FruitSimulationsSummary,
} from "games/fruit-picker/simulator";
import { NMTCodeInfo } from "games/neural_machine_translation/hooks/use-with-nn-code-examine";
import {
  NMTSimulationOutput,
  NMTSimulationsSummary,
} from "games/neural_machine_translation/simulator";
import { PlaneCodeInfo } from "games/planes/hooks/use-with-plane-code-examine";
import {
  PlaneSimulationOutput,
  PlaneSimulationsSummary,
} from "games/planes/simulator";
import { ImproveCodeHint } from "hooks/use-with-improve-code";
import {
  EXPERIMENT_HISTORY,
  localStorageGet,
  localStorageStore,
} from "../../local-storage";

export type SimulationOutput =
  | CafeSimulationOutput
  | FruitSimulationOutput
  | NMTSimulationOutput
  | PlaneSimulationOutput;

export type SimulationSummary =
  | CafeSimulationsSummary
  | FruitSimulationsSummary
  | NMTSimulationsSummary
  | PlaneSimulationsSummary;

export interface GameSimulationsSummary {
  lowAccuracy: number;
  highAccuracy: number;
  averageAccuracy: number;
  averagePrecision: number;
  averageRecall: number;
  averageF1Score: number;
  lowF1Score: number;
  highF1Score: number;
}

export interface Simulator {
  play: () => SimulationOutput;
  simulate: (
    inputs: number[],
    outputs: any,
    notebook: INotebookState,
    displayedHints: ImproveCodeHint[]
  ) => Experiment;
}

export type CodeInfo =
  | CafeCodeInfo
  | FruitPickerCodeInfo
  | NMTCodeInfo
  | PlaneCodeInfo;

type LoadStatus = "LOADING" | "LOADED";
interface LoadedCodeInfo {
  codeInfo: CodeInfo;
  loadStatus: LoadStatus;
}

export enum ActivityID {
  cafe = "cafe",
  fruit = "fruitpicker",
  nmt = "neural_machine_translation",
  planes = "planes",
}

export type ActivityType = "GAME" | "NOTEBOOK_ONLY";

export interface Activity {
  id: ActivityID;
  title: string;
  activityType: ActivityType;
  gameDescription: string;
  notebookDescription: string;
  autocompletion?: Completion[];
  improveCodeHints: ImproveCodeHint[];
  codeExamine: (
    userCode: Record<string, string[]>,
    validationCellOutput: any,
    numCodeRuns: number
  ) => LoadedCodeInfo;
  extractValidationCellOutput?: (cell: ICellModel) => any;
}

export interface Experiment {
  id: string;
  time: Date;
  trainInstances: number;
  testInstances: number;
  simulations: SimulationOutput[];
  notebookContent: INotebookContent | undefined;
  codeInfo: CodeInfo;
  activityId: ActivityID;
  summary: SimulationSummary;
  evaluationScore: number;
  displayedHints: ImproveCodeHint[];
}

export type ExperimentHistory = Record<ActivityID, Experiment[]>;

export interface SimulationState {
  experiments: ExperimentHistory;
}
const initialState: SimulationState = {
  experiments: getExperimentHistory(),
};
function getExperimentHistory(): ExperimentHistory {
  let experiments = localStorageGet(EXPERIMENT_HISTORY) as ExperimentHistory;
  if (!experiments) {
    experiments = {
      cafe: [],
      fruitpicker: [],
      neural_machine_translation: [],
      planes: [],
    };
  }
  return experiments;
}

export const simulationSlice = createSlice({
  name: "simulation",
  initialState,
  reducers: {
    addExperiment: (
      state,
      action: PayloadAction<{ id: ActivityID; experiment: Experiment }>
    ) => {
      const { id, experiment } = action.payload;
      state.experiments[id].push(experiment);
      localStorageStore(EXPERIMENT_HISTORY, state.experiments);
    },
    clearExperiments: (state, action: PayloadAction<ActivityID>) => {
      state.experiments[action.payload] = [];
      localStorageStore(EXPERIMENT_HISTORY, state.experiments);
    },
  },
});

export const { addExperiment, clearExperiments } = simulationSlice.actions;

export default simulationSlice.reducer;
