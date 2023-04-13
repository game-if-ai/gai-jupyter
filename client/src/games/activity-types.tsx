/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  CafeExperiment,
  CafeSimulationOutput,
  CafeSimulationsSummary,
  CafeSimulator,
} from "./cafe/simulator";
import {
  FruitPickerExperiment,
  FruitSimulationOutput,
  FruitSimulationsSummary,
} from "./fruit-picker/simulator";
import {
  NMTExperiment,
  NMTSimulationOutput,
  NMTSimulationsSummary,
  NMTSimulator,
} from "./neural_machine_translation/simulator";
import { FruitSimulator } from "./fruit-picker/simulator";
import { CafeCodeInfo } from "./cafe/hooks/use-with-cafe-code-examine";
import { FruitPickerCodeInfo } from "./fruit-picker/hooks/use-with-fruit-picker-code-examine";
import { NMTCodeInfo } from "./neural_machine_translation/hooks/use-with-nn-code-examine";

export type SIMULATION_TYPES =
  | CafeSimulationOutput
  | FruitSimulationOutput
  | NMTSimulationOutput;

export type AllExperimentTypes =
  | CafeExperiment
  | FruitPickerExperiment
  | NMTExperiment;

export type AllSummaryTypes =
  | CafeSimulationsSummary
  | FruitSimulationsSummary
  | NMTSimulationsSummary;

export type GameExperimentTypes = CafeExperiment | FruitPickerExperiment;

export type AllSimulatorTypes = NMTSimulator | FruitSimulator | CafeSimulator;

export type CodeInfoTypes = CafeCodeInfo | FruitPickerCodeInfo | NMTCodeInfo;
