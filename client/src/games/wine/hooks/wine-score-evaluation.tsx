/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { Experiment } from "store/simulator";
import { WineCodeInfo } from "./use-with-wine-code-examine";

export function evaluteWineExperiment(curExperiment: Experiment) {
  let finalScore = 0;
  const codeInfo = curExperiment.codeInfo as WineCodeInfo;
  const pointsPerElement = 1 / 12;
  const {
    callsFitOnTexts,
    callsTextsToSequences,
    callsPadSequences,
    callsPadSequencesWithPaddingPost,
    callsPadSequencesTwice,
    callsPadSequencesTwiceWithPaddingPost,
    callsReshape,
    callsReshapeOnXAndY,
    callsArgmax,
    dataIsNumpyArray,
    preprocessedDataCorrectDimensions,
    outputCorrectlyFormatted,
  } = codeInfo;
  callsFitOnTexts && (finalScore += pointsPerElement);
  callsTextsToSequences && (finalScore += pointsPerElement);
  callsPadSequences && (finalScore += pointsPerElement);
  callsPadSequencesWithPaddingPost && (finalScore += pointsPerElement);
  callsPadSequencesTwice && (finalScore += pointsPerElement);
  callsPadSequencesTwiceWithPaddingPost && (finalScore += pointsPerElement);
  callsReshape && (finalScore += pointsPerElement);
  callsReshapeOnXAndY && (finalScore += pointsPerElement);
  callsArgmax && (finalScore += pointsPerElement);
  dataIsNumpyArray && (finalScore += pointsPerElement);
  preprocessedDataCorrectDimensions && (finalScore += pointsPerElement);
  outputCorrectlyFormatted && (finalScore += pointsPerElement);
  return finalScore;
}
