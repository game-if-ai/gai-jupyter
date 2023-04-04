import { NMTCodeInfo } from "./use-with-nn-code-examine";

export function getAllNMTCodeInfo(userCode: string[]): NMTCodeInfo {
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
