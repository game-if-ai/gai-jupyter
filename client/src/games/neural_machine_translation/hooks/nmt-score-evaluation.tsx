import { NMTExperiment } from "../simulator";

export function evaluteNMTExperiment(curExperiment: NMTExperiment) {
  return curExperiment.codeInfo.outputCorrectlyFormatted ? 1 : 0;
}
