/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { NNTFCodeInfo } from "./use-with-nn-tf-code-examine";

export interface ClusterGroup {
  numMembers: number;
  quality: number;
}

export function getAllNNTFCodeInfo(userCode: string[]): NNTFCodeInfo {
  return {
    normalizeTrainImages: normalizeTrainImages(userCode),
    normalizeTestImages: normalizeTestImages(userCode),
    addReluDenseLayer: addReluDenseLayer(userCode),
    addSoftmaxDenseLayer: addSoftmaxDenseLayer(userCode),
    specifyAdamOptimizer: specifyAdamOptimizer(userCode),
    specifySparseCategoricalCrossentropy:
      specifySparseCategoricalCrossentropy(userCode),
    specifyEpochs: specifyEpochs(userCode),
    usesModelPredict: usesModelPredict(userCode),
    usesNpArgmax: usesNpArgmax(userCode),
  };
}

function codeContainsRegex(userCode: string[], regex: RegExp): boolean {
  return Boolean(userCode.find((codeLine) => codeLine.match(regex)));
}

function normalizeTrainImages(userCode: string[]): boolean {
  return codeContainsRegex(userCode, /train_images\\s*=\\s*\\w+\\s*\\s*255.0/);
}

function normalizeTestImages(userCode: string[]): boolean {
  return codeContainsRegex(userCode, /test_images\\s*=\\s*\\w+\\s*\\s*255.0/);
}

function addReluDenseLayer(userCode: string[]): boolean {
  return codeContainsRegex(
    userCode,
    /Dense\\(\\s*\\d+\\s*,\\s*activation\\s*=\\s*['\"]relu['\"]\\s*\\)/
  );
}

function addSoftmaxDenseLayer(userCode: string[]): boolean {
  return codeContainsRegex(
    userCode,
    /Dense\\(\\s*10\\s*,\\s*activation\\s*=\\s*['\"]softmax['\"]\\s*\\)/
  );
}

function specifyAdamOptimizer(userCode: string[]): boolean {
  return codeContainsRegex(userCode, /optimizer\\s*=\\s*['\"]adam['\"]/);
}

function specifySparseCategoricalCrossentropy(userCode: string[]): boolean {
  return codeContainsRegex(
    userCode,
    /loss\\s*=\\s*tf\\.keras\\.losses\\.SparseCategoricalCrossentropy\\(\\s*\\)/
  );
}

function specifyEpochs(userCode: string[]): boolean {
  return codeContainsRegex(userCode, /epochs\\s*=\\s*\\d+/);
}

function usesModelPredict(userCode: string[]): boolean {
  return codeContainsRegex(userCode, /model\\.predict\\(\\s*x_new\\s*\\)/);
}

function usesNpArgmax(userCode: string[]): boolean {
  return codeContainsRegex(
    userCode,
    /np\\.argmax\\(\\s*y_proba\\s*,\\s*axis\\s*=\\s*-1\\s*\\)/
  );
}

export interface NNTFClassifierOutput {
  testAccuracy: number;
}

export function processData(
  validationCellOutput: string
): NNTFClassifierOutput {
  // TODO: this needs to be updated to support the new NNTF output format

  return {
    testAccuracy: 0,
  };
}

/**
 *
 * @param validationCellOutput a string that contains csv stringified data
 */
export function extractNNTFCellOutput(
  validationCellOutput: any
): NNTFClassifierOutput {
  return processData(validationCellOutput);
}
