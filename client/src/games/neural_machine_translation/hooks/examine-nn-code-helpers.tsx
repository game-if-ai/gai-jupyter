/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { ICellModel } from "@jupyterlab/cells";
import { IOutput, isError, isStream } from "@jupyterlab/nbformat";
import { PartialJSONObject } from "@lumino/coreutils";
import { NMTCodeInfo } from "./use-with-nn-code-examine";
import { splitListOfStringsBy } from "../../../utils";

export function getAllNMTCodeInfo(
  userCode: string[],
  validationCellOutput: string[]
): NMTCodeInfo {
  return {
    callsFitOnTexts: callsFitOnTexts(userCode),
    callsTextsToSequences: callsTextsToSequences(userCode),
    callsPadSequences: callsPadSequences(userCode),
    callsPadSequencesWithPaddingPost:
      callsPadSequencesWithPaddingPost(userCode),
    callsPadSequencesTwice: callsPadSequencesTwice(userCode),
    callsPadSequencesTwiceWithPaddingPost:
      callsPadSequencesTwiceWithPaddingPost(userCode),
    callsReshape: callsReshape(userCode),
    callsReshapeOnXAndY: callsReshapeOnXAndY(userCode),
    callsArgmax: callsArgmax(userCode),
    callsJoin: callsJoin(userCode),

    hasValidationOutput: validationCellOutput.length > 0,
    dataIsNumpyArray: dataIsNumpyArray(validationCellOutput),
    keywordZeroLookup: keywordZeroLookup(validationCellOutput),
    preprocessedDataCorrectDimensions:
      preprocessedDataCorrectDimensions(validationCellOutput),
    outputCorrectlyFormatted: outputCorrectlyFormatted(validationCellOutput),
  };
}

function callsJoin(userCode: string[]): boolean {
  return Boolean(userCode.find((codeLine) => codeLine.match(/.join\(.*\)/)));
}

function callsPadSequencesWithPaddingPost(userCode: string[]): boolean {
  return Boolean(
    userCode.find((codeLine) =>
      codeLine.match(/pad_sequences\(.*padding=.*post.*\)/)
    )
  );
}

function callsPadSequencesTwiceWithPaddingPost(userCode: string[]): boolean {
  return (
    userCode.filter((codeLine) =>
      codeLine.match(/pad_sequences\(.*padding=.*post.*\)/)
    ).length > 1
  );
}

function validationCellOutputMatch(
  validationCellOutput: string[] | string,
  regex: RegExp
): boolean {
  return Boolean(
    (typeof validationCellOutput === "string" &&
      validationCellOutput.match(regex)) ||
      (Array.isArray(validationCellOutput) &&
        validationCellOutput.find((outputLine) => outputLine.match(regex)))
  );
}

function outputCorrectlyFormatted(
  validationCellOutput: string[] | string
): boolean {
  return validationCellOutputMatch(
    validationCellOutput,
    /Predicted translation:.*new jersey/
  );
}

function keywordZeroLookup(validationCellOutput: string[] | string): boolean {
  return (
    validationCellOutputMatch(validationCellOutput, /KeyError/) &&
    validationCellOutputMatch(validationCellOutput, /0/)
  );
}

function preprocessedDataCorrectDimensions(
  validationCellOutput: string[] | string
): boolean {
  return (
    validationCellOutputMatch(
      validationCellOutput,
      /preproc_english_sentences_shape.*(137861,.*21,.*1)/
    ) &&
    validationCellOutputMatch(
      validationCellOutput,
      /preproc_french_sentences_shape.*(137861,.*21,.*1)/
    )
  );
}

function dataIsNumpyArray(validationCellOutput: string[]): boolean {
  return (
    validationCellOutputMatch(
      validationCellOutput,
      /preproc_english_sentences_type.*<class 'numpy.ndarray'>/
    ) &&
    validationCellOutputMatch(
      validationCellOutput,
      /preproc_french_sentences_type.*<class 'numpy.ndarray'>/
    )
  );
}

function callsArgmax(userCode: string[]): boolean {
  return Boolean(userCode.find((codeLine) => codeLine.match(/.argmax\(.*\)/)));
}

function callsPadSequences(userCode: string[]): boolean {
  return Boolean(userCode.find((codeLine) => codeLine.match(/pad_sequences/)));
}

function callsPadSequencesTwice(userCode: string[]): boolean {
  return (
    userCode.filter((codeLine) => codeLine.match(/pad_sequences/)).length > 1
  );
}

function callsReshape(userCode: string[]): boolean {
  return Boolean(userCode.find((codeLine) => codeLine.match(/reshape/)));
}

export function callsFitOnTexts(userCode: string[]) {
  const fitOnTextFuncUsed = Boolean(
    userCode.find((codeLine) => codeLine.match(/.fit_on_texts\(.*\)/))
  );
  return fitOnTextFuncUsed;
}

export function callsTextsToSequences(userCode: string[]) {
  const textsToSequencesFuncUsed = Boolean(
    userCode.find((codeLine) => codeLine.match(/.texts_to_sequences\(.*\)/))
  );
  return textsToSequencesFuncUsed;
}

export function isRemovingStopwords(userCode: string[]): boolean {
  const importsStopwords = Boolean(
    userCode.find((codeLine) => codeLine.match(/import.*stopwords/))
  );
  const initializesStopwords = Boolean(
    userCode.find((codeLine) => codeLine.match(/stopwords.words\(.*\)/))
  );
  return importsStopwords && initializesStopwords;
}

export function callsReshapeOnXAndY(userCode: string[]): boolean {
  const reshapesX = Boolean(
    userCode.find((codeLine) => codeLine.match(/reshape\(.*x.*\)/i))
  );
  const reshapesY = Boolean(
    userCode.find((codeLine) => codeLine.match(/reshape\(.*y.*\)/i))
  );
  return reshapesX && reshapesY;
}

export function extractNMTCellOutput(cell: ICellModel): string[] {
  const cellData = cell.toJSON();
  const cellOutputs = cellData.outputs as IOutput[];
  return cellOutputs.reduce((acc: string[], curOutput) => {
    if (isError(curOutput)) {
      return [...acc, curOutput.ename, curOutput.evalue];
    } else if (isStream(curOutput)) {
      const textOutput = curOutput.text;
      if (textOutput.includes("you can ignore this message")) {
        return acc;
      }
      return Array.isArray(textOutput)
        ? [...acc, ...splitListOfStringsBy(textOutput, "\n")]
        : [...acc, ...textOutput.split("\n")];
    } else {
      try {
        const outputData =
          (curOutput.data &&
            ((curOutput.data as PartialJSONObject)[
              "application/json"
            ] as any)) ||
          {};
        return [...acc, JSON.stringify(outputData)];
      } catch (err) {
        console.error(err);
        return acc;
      }
    }
  }, []);
}
