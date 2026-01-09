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
    // code requirements
    trainImageNormalization: trainImageNormalization(userCode),
    testImageNormalization: testImageNormalization(userCode),
    hiddenLayerUnits: hiddenLayerUnits(userCode),
    hiddenLayerActivation: hiddenLayerActivation(userCode),
    modelOptimizer: modelOptimizer(userCode),
    lossFunction: lossFunction(userCode),
    fitTrainingData: fitTrainingData(userCode),
    fitTrainingLabels: fitTrainingLabels(userCode),
    validationSplitRatio: validationSplitRatio(userCode),
    trainingEpochs: trainingEpochs(userCode),
  };
}

function codeContainsRegex(userCode: string[], regex: RegExp): boolean {
  return Boolean(userCode.find((codeLine) => codeLine.match(regex)));
}

function trainImageNormalization(userCode: string[]): boolean {
  return codeContainsRegex(
    userCode,
    /train_images\s*=\s*train_images\s*\/\s*255(\.0)?/
  );
}

function testImageNormalization(userCode: string[]): boolean {
  return codeContainsRegex(
    userCode,
    /test_images\s*=\s*test_images\s*\/\s*255(\.0)?/
  );
}

function hiddenLayerUnits(userCode: string[]): boolean {
  return codeContainsRegex(userCode, /Dense\s*\(\s*\d+\s*,\s*activation/);
}

function hiddenLayerActivation(userCode: string[]): boolean {
  return codeContainsRegex(userCode, /activation\s*=\s*['"]relu['"]/);
}

function modelOptimizer(userCode: string[]): boolean {
  return codeContainsRegex(
    userCode,
    /compile\s*\(\s*optimizer\s*=\s*['"]\w+['"]/
  );
}

function lossFunction(userCode: string[]): boolean {
  return codeContainsRegex(
    userCode,
    /loss\s*=\s*tf\.keras\.losses\.SparseCategoricalCrossentropy\s*\(\s*\)/
  );
}

function trainingEpochs(userCode: string[]): boolean {
  return codeContainsRegex(userCode, /epochs\s*=\s*\d+/);
}

function fitTrainingData(userCode: string[]): boolean {
  return codeContainsRegex(userCode, /model\.fit\s*\(\s*train_images\s*,/);
}

function fitTrainingLabels(userCode: string[]): boolean {
  return codeContainsRegex(userCode, /train_labels/);
}

function validationSplitRatio(userCode: string[]): boolean {
  return codeContainsRegex(userCode, /validation_split\s*=\s*0\.\d+/);
}

export interface NNTFClassifierOutput {
  // output validations
  testAccuracyOutput: boolean;
  testLossOutput: boolean;
  testImagePredictionsOutput: boolean;
  testPredictedClassLabelsOutput: boolean;
  testPredictedProbabilitiesOutput: boolean;
  testVerifyTrueLabelsOutput: boolean;
  testVerifyClassProbabilitiesOutput: boolean;
}

export function processData(
  validationCellOutput: string
): NNTFClassifierOutput {
  // TODO: this needs to be updated to support the new NNTF output format

  return {
    testAccuracyOutput: false,
    testLossOutput: false,
    testImagePredictionsOutput: false,
    testPredictedClassLabelsOutput: false,
    testPredictedProbabilitiesOutput: false,
    testVerifyTrueLabelsOutput: false,
    testVerifyClassProbabilitiesOutput: false,
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
