import { NMTCodeInfo } from "./use-with-nn-code-examine";
import { ICellModel } from "@jupyterlab/cells";
import { IOutput, isError, isStream } from "@jupyterlab/nbformat";
import { splitListOfStringsBy } from "../../../utils";
import { PartialJSONObject } from "@lumino/coreutils";

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
  return Boolean(
    userCode.find((codeLine)=>
      codeLine.match(/.join\(.*\)/)
    )
  );
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

function outputCorrectlyFormatted(validationCellOutput: string[]): boolean {
  return Boolean(
    validationCellOutput.find((outputLine) =>
      outputLine.match(/Predicted translation:.*new jersey/)
    )
  );
}

function keywordZeroLookup(validationCellOutput: string[]): boolean {
  return (
    Boolean(
      validationCellOutput.find((outputLine) => outputLine.match(/KeyError/))
    ) &&
    Boolean(validationCellOutput.find((outputLine) => outputLine.match(/0/)))
  );
}

function preprocessedDataCorrectDimensions(
  validationCellOutput: string[]
): boolean {
  return (
    Boolean(
      validationCellOutput.find((outputLine) =>
        outputLine.match(/preproc_english_sentences_shape.*(137861,.*21,.*1)/)
      )
    ) &&
    Boolean(
      validationCellOutput.find((outputLine) =>
        outputLine.match(/preproc_french_sentences_shape.*(137861,.*21,.*1)/)
      )
    )
  );
}

function dataIsNumpyArray(validationCellOutput: string[]): boolean {
  return (
    Boolean(
      validationCellOutput.find((outputLine) =>
        outputLine.match(
          /preproc_english_sentences_type.*<class 'numpy.ndarray'>/
        )
      )
    ) &&
    Boolean(
      validationCellOutput.find((outputLine) =>
        outputLine.match(
          /preproc_french_sentences_type.*<class 'numpy.ndarray'>/
        )
      )
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
