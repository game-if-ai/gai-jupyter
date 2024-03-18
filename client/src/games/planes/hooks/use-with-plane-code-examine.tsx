/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { getAllPlaneCodeInfo } from "./examine-plane-code-helpers";
import { useEffect, useState } from "react";

type LoadStatus = "LOADING" | "LOADED";
export enum ModelSize {
  TINY = "TINY",
  SMALL = "SMALL",
  MEDIUM = "MEDIUM",
  LARGE = "LARGE",
  UNDEFINED = "UNDEFINED",
}

export interface PlaneCodeInfo {
  modelSize: ModelSize;
  epochs: number;
}

export interface PlaneCodeInfoLoad extends PlaneCodeInfo {
  loadStatus: LoadStatus;
}

interface UseWithPlaneCodeExamine {
  codeInfo: PlaneCodeInfo;
  loadStatus: LoadStatus;
}

export function useWithPlaneCodeExamine(
  userCode: Record<string, string[]>
): UseWithPlaneCodeExamine {
  const [planeCodeInfo, setPlaneCodeInfo] = useState<PlaneCodeInfoLoad>({
    loadStatus: "LOADING",
    modelSize: ModelSize.UNDEFINED,
    epochs: 0,
  });

  useEffect(() => {
    if (Object.keys(userCode).length === 0) {
      return;
    }
    const allUserInputCode = Object.values(userCode).flat();
    setPlaneCodeInfo({
      ...getAllPlaneCodeInfo(allUserInputCode),
      loadStatus: "LOADED",
    });
  }, [userCode]);

  return {
    codeInfo: planeCodeInfo,
    loadStatus: planeCodeInfo.loadStatus,
  };
}
