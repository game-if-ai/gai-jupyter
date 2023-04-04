/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { INotebookState } from "@datalayer/jupyter-react";
import { ActivityID } from "games";
import { Experiment, Simulator } from "../simulator";
import { NMTCodeInfo } from "./hooks/use-with-nn-code-examine";
import { getAllNMTCodeInfo } from "./hooks/examine-nn-code-helpers";
import { extractAllUserInputCode } from "../../utils";

export interface NMTSimulationOutput {}

export type NMTClassifierOutput = string[];

export interface NMTSimulationsSummary {}

export type NMTExperiment = Experiment<
  NMTSimulationOutput,
  NMTSimulationsSummary,
  NMTCodeInfo
>;

export class NMTSimulator extends Simulator<
  NMTSimulationOutput,
  NMTSimulationsSummary,
  NMTCodeInfo
> {
  scoreExperiment(experiment: NMTExperiment): number {
    return experiment.codeInfo.outputCorrectlyFormatted ? 1 : 0;
  }

  updateSummary(
    simulations: NMTSimulationOutput[],
    summary: NMTSimulationsSummary
  ): NMTSimulationsSummary {
    return {};
  }

  play(): NMTSimulationOutput {
    return {};
  }

  simulate(
    inputs: number[],
    outputs: NMTClassifierOutput,
    notebook: INotebookState,
    activityId: ActivityID
  ): NMTExperiment {
    const experiment = super.simulate(inputs, outputs, notebook, activityId);
    if (experiment.notebookContent) {
      experiment.codeInfo = getAllNMTCodeInfo(
        extractAllUserInputCode(experiment.notebookContent),
        outputs
      );
    }
    experiment.evaluationScore = this.scoreExperiment(experiment);
    this.experiments.push(experiment);

    experiment.evaluationScore = this.scoreExperiment(experiment);
    return experiment;
  }
}
