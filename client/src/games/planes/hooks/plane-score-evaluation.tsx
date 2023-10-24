/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { Experiment } from "store/simulator";
import { PlaneCodeInfo } from "./use-with-plane-code-examine";

export function evaluatePlaneExperiment(curExperiment: Experiment) {
  let finalScore = 0;

  const codeInfo = curExperiment.codeInfo as PlaneCodeInfo;
  const tinyThirty = codeInfo.epochs === 30 && codeInfo.modelSize === "TINY";
  const tinySixty = codeInfo.epochs === 60 && codeInfo.modelSize === "TINY";
  const smallThirty = codeInfo.epochs === 30 && codeInfo.modelSize === "SMALL";
  const smallSixty = codeInfo.epochs === 60 && codeInfo.modelSize === "SMALL";
  const mediumThirty =
    codeInfo.epochs === 30 && codeInfo.modelSize === "MEDIUM";
  const mediumSixty = codeInfo.epochs === 60 && codeInfo.modelSize === "MEDIUM";
  const largeThirty = codeInfo.epochs === 30 && codeInfo.modelSize === "LARGE";
  const largeSixty = codeInfo.epochs === 60 && codeInfo.modelSize === "LARGE";

  if (tinyThirty) {
    return 0.6;
  }

  if (tinySixty) {
    return 0.7;
  }

  if (smallThirty) {
    return 0.3;
  }

  if (smallSixty) {
    return 0.4;
  }

  if (mediumThirty) {
    return 0.9;
  }

  if (mediumSixty) {
    return 1;
  }

  if (largeThirty) {
    return 0.5;
  }

  if (largeSixty) {
    return 0.8;
  }

  return finalScore;
}
