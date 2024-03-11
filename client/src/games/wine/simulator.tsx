/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { INotebookState } from "@datalayer/jupyter-react";
import { WineCodeInfo } from "./hooks/use-with-wine-code-examine";
import { getAllWineCodeInfo } from "./hooks/examine-wine-code-helpers";
import { extractAllUserInputCode } from "../../utils";
import { evaluteWineExperiment } from "./hooks/wine-score-evaluation";
import { ImproveCodeHint } from "hooks/use-with-improve-code";
import { ActivityID, Experiment, Simulator } from "../../store/simulator";
import { initSimulate } from "../../store/simulator/useWithSimulator";

export interface WineSimulationOutput {}

export type WineClassifierOutput = string[];

export interface WineSimulationsSummary extends WineCodeInfo {}

export function WineSimulator(): Simulator {
  function scoreExperiment(experiment: Experiment): number {
    return evaluteWineExperiment(experiment);
  }

  function play(): WineSimulationOutput {
    return {};
  }

  function simulate(
    inputs: number[],
    outputs: WineClassifierOutput,
    notebook: INotebookState,
    displayedHints: ImproveCodeHint[]
  ): Experiment {
    const experiment = initSimulate(
      inputs,
      notebook,
      ActivityID.nmt,
      displayedHints
    );
    if (experiment.notebookContent) {
      experiment.codeInfo = getAllWineCodeInfo(
        extractAllUserInputCode(experiment.notebookContent),
        outputs
      );
    }
    // experiment.summary = experiment.codeInfo;
    experiment.evaluationScore = scoreExperiment(experiment);
    return experiment;
  }

  return {
    play,
    simulate,
  };
}
