/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { PlaneCodeInfo, ModelSize } from "./use-with-plane-code-examine";

export function getAllPlaneCodeInfo(userCode: string[]): PlaneCodeInfo {
  return {
    epochs: getEpochs(userCode),
    modelSize: getModelSize(userCode),
  };
}

export function getEpochs(userCode: string[]): number {
  if (userCode.find((codeline) => codeline.match(/60/))) return 60;
  else if (userCode.find((codeline) => codeline.match(/30/))) return 30;
  else return 0;
}

export function getModelSize(userCode: string[]): ModelSize {
  if (userCode.find((codeline) => codeline.match(/tiny/))) return "TINY";
  else if (userCode.find((codeline) => codeline.match(/small/))) return "SMALL";
  else if (userCode.find((codeline) => codeline.match(/medium/)))
    return "MEDIUM";
  else if (userCode.find((codeline) => codeline.match(/large/))) return "LARGE";
  else return "UNDEFINED";
}
