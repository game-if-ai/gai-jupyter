/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { INotebookState } from "@datalayer/jupyter-react";
import {
  extractNNTFCellOutput,
  getAllNNTFCodeInfo,
} from "./hooks/examine-nn-tf-code-helpers";
import { extractAllUserInputCode } from "../../utils";
import { ImproveCodeHint } from "hooks/use-with-improve-code";
import { ActivityID, Experiment, Simulator } from "../../store/simulator";
import { initSimulate } from "../../store/simulator/helpers";
import nntfScoreEvaluation from "./hooks/nn-tf-score-evalutaion";
import { NNTFCodeInfo } from "./hooks/use-with-nn-tf-code-examine";

export interface NNTFSimulationOutput {}

export interface NNTFSimulationsSummary extends NNTFCodeInfo {
  // output validations
  testAccuracyOutput: number;
  testLossOutput: number;
}

export function NNTFSimulator(): Simulator {
  function play(): NNTFSimulationOutput {
    return {};
  }

  function simulate(
    inputs: number[],
    outputs: any,
    notebook: INotebookState,
    displayedHints: ImproveCodeHint[]
  ): Experiment {
    const experiment = initSimulate(
      inputs,
      notebook,
      ActivityID.nntf,
      displayedHints
    );
    if (experiment.notebookContent) {
      experiment.codeInfo = getAllNNTFCodeInfo(
        extractAllUserInputCode(experiment.notebookContent)
      );
    }
    const data = extractNNTFCellOutput(outputs);
    experiment.summary = {
      ...(experiment.codeInfo as NNTFCodeInfo),
      testAccuracyOutput: data.testAccuracyOutput,
      testLossOutput: data.testLossOutput,
    };
    experiment.evaluationScore = nntfScoreEvaluation(experiment);
    return experiment;
  }

  return {
    play,
    simulate,
  };
}
