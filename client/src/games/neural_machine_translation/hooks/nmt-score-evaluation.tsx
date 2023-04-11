import { NMTExperiment } from "../simulator";

export function evaluteNMTExperiment(curExperiment: NMTExperiment) {
  let finalScore = 0;
  const pointsPerElement = 1 / 8;
  const {
    preprocessWithTokenizer,
    padsData,
    reshapesData,
    utilizesTokenizerWordIndex,
    utilizesArgmax,
    dataIsNumpyArray,
    preprocessedDataCorrectDimensions,
    outputCorrectlyFormatted,
  } = curExperiment.codeInfo;
  preprocessWithTokenizer && (finalScore += pointsPerElement);
  padsData && (finalScore += pointsPerElement);
  reshapesData && (finalScore += pointsPerElement);
  utilizesTokenizerWordIndex && (finalScore += pointsPerElement);
  utilizesArgmax && (finalScore += pointsPerElement);
  dataIsNumpyArray && (finalScore += pointsPerElement);
  preprocessedDataCorrectDimensions && (finalScore += pointsPerElement);
  outputCorrectlyFormatted && (finalScore += pointsPerElement);
  return finalScore;
}
