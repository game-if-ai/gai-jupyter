/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  ClassifierModel,
  FeatureExtractionMethods,
  getAllUserCodeInfo,
} from "../examine-code-utils";
import { useEffect, useState } from "react";
import { useWithCellOutputs } from "./use-with-notebook";

type LoadStatus = "LOADING" | "LOADED";

export interface UserCodeInfo {
  usingLemmatization: boolean;
  removesStopwords: boolean;
  cleansContractions: boolean;
  classifierModelUsed: ClassifierModel;
  featureExtractionUsed: FeatureExtractionMethods;
}

export interface UserCodeInfoLoad extends UserCodeInfo {
  loadStatus: LoadStatus;
}

export function useWithUserCodeExamine() {
  const { userInputCellsCode: userCode } = useWithCellOutputs();

  const [userCodeInfo, setUserCodeInfo] = useState<UserCodeInfoLoad>({
    usingLemmatization: false,
    classifierModelUsed: "NONE",
    featureExtractionUsed: "NONE",
    removesStopwords: false,
    cleansContractions: false,
    loadStatus: "LOADING",
  });

  useEffect(() => {
    if (Object.keys(userCode).length === 0) {
      return;
    }
    const allUserInputCode = Object.values(userCode).flat();
    setUserCodeInfo({
      ...getAllUserCodeInfo(allUserInputCode),
      loadStatus: "LOADED",
    });
  }, [userCode]);

  return {
    userCodeInfo,
  };
}
