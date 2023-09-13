/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { Completion } from "@codemirror/autocomplete";
import { Simulator } from "./simulator";
import Cafe from "./cafe";
import FruitPicker from "./fruit-picker";
import { ICellModel } from "@jupyterlab/cells";

import NeuralMachineTranslation from "./neural_machine_translation";
import {
  AllSimulatorTypes,
  CodeInfoTypes,
  SIMULATION_TYPES,
} from "./activity-types";
import { ImproveCodeHint } from "../hooks/use-with-improve-code";

export type ActivityID = "fruitpicker" | "cafe" | "neural_machine_translation";
export type ActivityType = "GAME" | "NOTEBOOK_ONLY";
type LoadStatus = "LOADING" | "LOADED";

interface LoadedCodeInfo {
  codeInfo: CodeInfoTypes;
  loadStatus: LoadStatus;
}

export interface Activity {
  id: ActivityID;
  title: string;
  activityType: ActivityType;
  gameDescription: string;
  notebookDescription: string;
  autocompletion?: Completion[];
  simulator: AllSimulatorTypes;
  improveCodeHints: ImproveCodeHint[];
  codeExamine: (
    userCode: Record<string, string[]>,
    validationCellOutput: any,
    numCodeRuns: number
  ) => LoadedCodeInfo;
  extractValidationCellOutput?: (cell: ICellModel) => any;
}

export interface Game extends Activity {
  activityType: "GAME";
  config: Phaser.Types.Core.GameConfig;
  summaryPanel: (props: { simulation: SIMULATION_TYPES }) => JSX.Element;
}

export function isGameActivity(object: Activity): object is Game {
  return object.activityType === "GAME";
}

export interface GameParams<Simulation, SimulationsSummary, CodeInfo> {
  playManually: boolean;
  isMuted: boolean;
  speed: number;
  eventSystem: Phaser.Events.EventEmitter;
  simulator: Simulator<Simulation, SimulationsSummary, CodeInfo>;
  simulation?: Simulation;
}

export const Activities: Activity[] = [
  NeuralMachineTranslation,
  FruitPicker,
  Cafe,
];
