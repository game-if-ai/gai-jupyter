import { NNCodeInfo } from "./use-with-nn-code-examine";

export function getAllNNCodeInfo(userCode: string[]): NNCodeInfo {
  return {
    removesStopwords: isRemovingStopwords(userCode),
  };
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
