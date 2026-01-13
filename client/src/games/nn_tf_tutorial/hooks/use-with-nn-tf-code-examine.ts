/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { useEffect, useState } from "react";
import { getAllNNTFCodeInfo } from "./examine-nn-tf-code-helpers";

type LoadStatus = "LOADING" | "LOADED";

export interface NNTFCodeInfo {
  trainImageNormalization: boolean;
  testImageNormalization: boolean;
  hiddenLayerUnits: boolean;
  hiddenLayerActivation: boolean;
  modelOptimizer: boolean;
  lossFunction: boolean;
  fitTrainingData: boolean;
  fitTrainingLabels: boolean;
  validationSplitRatio: boolean;
  trainingEpochs: boolean;
}

export interface UserCodeInfoLoad extends NNTFCodeInfo {
  loadStatus: LoadStatus;
}

interface UseWithNNTFCodeExamine {
  codeInfo: NNTFCodeInfo;
  loadStatus: LoadStatus;
}

export function useWithNNTFCodeExamine(
  userCode: Record<string, string[]>,
  validationCellOutput: string[],
  notebookRunCount: number
): UseWithNNTFCodeExamine {
  const [nntfCodeInfo, setNNTFCodeInfo] = useState<UserCodeInfoLoad>({
    trainImageNormalization: false,
    testImageNormalization: false,
    hiddenLayerUnits: false,
    hiddenLayerActivation: false,
    modelOptimizer: false,
    lossFunction: false,
    fitTrainingData: false,
    fitTrainingLabels: false,
    validationSplitRatio: false,
    trainingEpochs: false,
    loadStatus: "LOADING",
  });

  useEffect(() => {
    if (Object.keys(userCode).length === 0) {
      return;
    }
    const allUserInputCode = Object.values(userCode).reduce(
      (acc, curr) => acc.concat(curr),
      []
    );
    setNNTFCodeInfo({
      ...getAllNNTFCodeInfo(allUserInputCode),
      loadStatus: "LOADED",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userCode, JSON.stringify(validationCellOutput), notebookRunCount]);

  return {
    codeInfo: nntfCodeInfo,
    loadStatus: nntfCodeInfo.loadStatus,
  };
}
