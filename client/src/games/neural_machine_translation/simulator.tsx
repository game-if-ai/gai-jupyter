/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { INotebookState } from "@datalayer/jupyter-react";
import { NMTCodeInfo } from "./hooks/use-with-nn-code-examine";
import { getAllNMTCodeInfo } from "./hooks/examine-nn-code-helpers";
import { extractAllUserInputCode } from "../../utils";
import { evaluteNMTExperiment } from "./hooks/nmt-score-evaluation";
import { ImproveCodeHint } from "hooks/use-with-improve-code";
import { Experiment, Simulator } from "../../store/simulator";
import { initSimulate } from "../../store/simulator/useWithSimulator";

export interface NMTSimulationOutput {}

export type NMTClassifierOutput = string[];

export interface NMTSimulationsSummary extends NMTCodeInfo {}

export function NMTSimulator(): Simulator {
  function scoreExperiment(experiment: Experiment): number {
    return evaluteNMTExperiment(experiment);
  }

  function play(): NMTSimulationOutput {
    return {};
  }

  function simulate(
    inputs: number[],
    outputs: NMTClassifierOutput,
    notebook: INotebookState,
    displayedHints: ImproveCodeHint[]
  ): Experiment {
    const experiment = initSimulate(
      inputs,
      notebook,
      "neural_machine_translation",
      displayedHints
    );
    if (experiment.notebookContent) {
      experiment.codeInfo = getAllNMTCodeInfo(
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
