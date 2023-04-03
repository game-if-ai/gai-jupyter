/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { useEffect, useState } from "react";
import { getAllNNCodeInfo } from "./examine-nn-code-helpers";

type LoadStatus = "LOADING" | "LOADED";

export interface NNCodeInfo {
  removesStopwords: boolean;
}

export interface UserCodeInfoLoad extends NNCodeInfo {
  loadStatus: LoadStatus;
}

interface UseWithNNCodeExamine {
  codeInfo: NNCodeInfo;
  loadStatus: LoadStatus;
}

export function useWithNNCodeExamine(
  userCode: Record<string, string[]>
): UseWithNNCodeExamine {
  const [nnCodeInfo, setNNCodeinfo] = useState<UserCodeInfoLoad>({
    removesStopwords: false,
    loadStatus: "LOADING",
  });

  useEffect(() => {
    if (Object.keys(userCode).length === 0) {
      return;
    }
    const allUserInputCode = Object.values(userCode).flat();
    setNNCodeinfo({
      ...getAllNNCodeInfo(allUserInputCode),
      loadStatus: "LOADED",
    });
  }, [userCode]);

  return {
    codeInfo: nnCodeInfo,
    loadStatus: nnCodeInfo.loadStatus,
  };
}
