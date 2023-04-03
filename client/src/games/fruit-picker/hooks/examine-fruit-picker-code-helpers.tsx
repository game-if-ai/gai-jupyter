/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { FruitPickerCodeInfo } from "./use-with-fruit-picker-code-examine";

export type ClassifierModel =
  | "NAIVE_BAYES"
  | "LOGISTIC_REGRESSION"
  | "DUMMY"
  | "NONE";
export type FeatureExtractionMethods =
  | "HASHING"
  | "TFIDF"
  | "COUNT_VECTORIZER"
  | "NONE";

export function getAllFruitPickerCodeInfo(
  userCode: string[]
): FruitPickerCodeInfo {
  return {
    usingLemmatization: isUsingLemmatization(userCode),
    classifierModelUsed: getClassifierModelUsed(userCode),
    featureExtractionUsed: getFeatureExtractionMethodUsed(userCode),
    removesStopwords: isRemovingStopwords(userCode),
    cleansContractions: isCleaningContractions(userCode),
  };
}

export function isUsingLemmatization(userCode: string[]): boolean {
  const importsLemmatizer = Boolean(
    userCode.find((codeLine) => codeLine.match(/import.*WordNetLemmatizer/))
  );
  const usesLemmatizer = Boolean(
    userCode.find((codeLine) => codeLine.match(/lemmatize\(.+\)/))
  );
  return importsLemmatizer && usesLemmatizer;
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

export function isCleaningContractions(userCode: string[]): boolean {
  const importsContractions = Boolean(
    userCode.find((codeLine) => codeLine.match(/import.*contractions/))
  );
  const usesContractionsFix = Boolean(
    userCode.find((codeLine) => codeLine.match(/contractions.fix\(.+\)/))
  );
  return importsContractions && usesContractionsFix;
}

export function getFeatureExtractionMethodUsed(
  userCode: string[]
): FeatureExtractionMethods {
  const usesHashing = Boolean(
    userCode.find((codeLine) => codeLine.match(/HashingVectorizer\(.*\)/))
  );
  const usesTfidf = Boolean(
    userCode.find((codeLine) => codeLine.match(/TfidfVectorizer\(.*\)/))
  );
  const usesCounting = Boolean(
    userCode.find((codeLine) => codeLine.match(/CountVectorizer\(.*\)/))
  );
  return usesHashing
    ? "HASHING"
    : usesTfidf
    ? "TFIDF"
    : usesCounting
    ? "COUNT_VECTORIZER"
    : "NONE";
}

export function getClassifierModelUsed(userCode: string[]): ClassifierModel {
  const usesLogisticRegression = Boolean(
    userCode.find((codeLine) => codeLine.match(/LogisticRegression\(.*\)/))
  );
  const usesNiavesBay = Boolean(
    userCode.find((codeLine) => codeLine.match(/MultinomialNB\(.*\)/))
  );
  const usesDummy = Boolean(
    userCode.find((codeLine) => codeLine.match(/DummyClassifier\(.*\)/))
  );
  return usesLogisticRegression
    ? "LOGISTIC_REGRESSION"
    : usesNiavesBay
    ? "NAIVE_BAYES"
    : usesDummy
    ? "DUMMY"
    : "NONE";
}
