/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { useEffect, useState } from "react";
import { getAllNNTFCodeInfo } from "./examine-nn-tf-code-helpers";

type LoadStatus = "LOADING" | "LOADED";

export interface NNTFCodeInfo {
  normalizeTrainImages: boolean;
  normalizeTestImages: boolean;
  addReluDenseLayer: boolean;
  addSoftmaxDenseLayer: boolean;
  specifyAdamOptimizer: boolean;
  specifySparseCategoricalCrossentropy: boolean;
  specifyEpochs: boolean;
  usesModelPredict: boolean;
  usesNpArgmax: boolean;
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
  validationCellOutput: any,
  notebookRunCount: number
): UseWithNNTFCodeExamine {
  const [nntfCodeInfo, setNNTFCodeInfo] = useState<UserCodeInfoLoad>({
    normalizeTrainImages: false,
    normalizeTestImages: false,
    addReluDenseLayer: false,
    addSoftmaxDenseLayer: false,
    specifyAdamOptimizer: false,
    specifySparseCategoricalCrossentropy: false,
    specifyEpochs: false,
    usesModelPredict: false,
    usesNpArgmax: false,
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
  }, [userCode, validationCellOutput, notebookRunCount]);

  return {
    codeInfo: nntfCodeInfo,
    loadStatus: nntfCodeInfo.loadStatus,
  };
}
