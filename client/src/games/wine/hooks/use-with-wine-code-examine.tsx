/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { useEffect, useState } from "react";
import { getAllWineCodeInfo } from "./examine-wine-code-helpers";

type LoadStatus = "LOADING" | "LOADED";

export interface WineCodeInfo {
  dropsWineColumn: boolean;
  dropsWineColumnWithAxis: boolean;
  savesQualityColumnBeforeDropping: boolean;
  dropsQualityColumn: boolean;
  dropsQualityColumnWithAxis: boolean;
  usesStandardScaler: boolean;
  fitsWithStandardScaler: boolean;
  transformsWithStandardScaler: boolean;
  usesDataframe: boolean;
}

export interface UserCodeInfoLoad extends WineCodeInfo {
  loadStatus: LoadStatus;
}

interface UseWithWineCodeExamine {
  codeInfo: WineCodeInfo;
  loadStatus: LoadStatus;
}

export function useWithWineCodeExamine(
  userCode: Record<string, string[]>,
  validationCellOutput: any,
  notebookRunCount: number
): UseWithWineCodeExamine {
  const [wineCodeInfo, setWineCodeInfo] = useState<UserCodeInfoLoad>({
    dropsWineColumn: false,
    dropsWineColumnWithAxis: false,
    savesQualityColumnBeforeDropping: false,
    dropsQualityColumn: false,
    dropsQualityColumnWithAxis: false,
    usesStandardScaler: false,
    fitsWithStandardScaler: false,
    transformsWithStandardScaler: false,
    usesDataframe: false,
    loadStatus: "LOADING",
  });

  useEffect(() => {
    if (Object.keys(userCode).length === 0) {
      return;
    }
    const allUserInputCode = Object.values(userCode).flat();
    setWineCodeInfo({
      ...getAllWineCodeInfo(allUserInputCode),
      loadStatus: "LOADED",
    });
  }, [userCode, validationCellOutput, notebookRunCount]);

  return {
    codeInfo: wineCodeInfo,
    loadStatus: wineCodeInfo.loadStatus,
  };
}
