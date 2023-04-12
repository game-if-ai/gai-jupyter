import { NMTExperiment } from "../simulator";

export function evaluteNMTExperiment(curExperiment: NMTExperiment) {
  let finalScore = 0;
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
  } = curExperiment.codeInfo;
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
