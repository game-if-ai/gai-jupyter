/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { Experiment } from "store/simulator";
import { WineCodeInfo } from "./use-with-wine-code-examine";
import { WineSimulationsSummary } from "../simulator";

export default function wineScoreEvaluation(experiment: Experiment): number {
  let finalScore = 0;
  const q = experiment.codeInfo as WineCodeInfo;
  const clusters = (experiment.summary as WineSimulationsSummary).clusters;

  q.dropsWineColumn && q.dropsWineColumnWithAxis
    ? (finalScore += 0.1)
    : (finalScore += 0);
  q.savesQualityColumnBeforeDropping ? (finalScore += 0.1) : (finalScore += 0);
  q.dropsQualityColumn && q.dropsQualityColumnWithAxis
    ? (finalScore += 0.1)
    : (finalScore += 0);
  q.usesStandardScaler ? (finalScore += 0.1) : (finalScore += 0);
  q.fitsWithStandardScaler ? (finalScore += 0.1) : (finalScore += 0);
  q.transformsWithStandardScaler ? (finalScore += 0.1) : (finalScore += 0);
  q.usesDataframe ? (finalScore += 0.1) : (finalScore += 0);
  clusters.length === 5 || clusters.length === 6
    ? (finalScore += 0.3)
    : (finalScore += 0);
  return finalScore;
}
