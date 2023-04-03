/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import Phaser from "phaser";
import { CafeSimulator } from "./simulator";
import MainMenu from "./MainMenu";
import MainGame from "./MainGame";
import { Summary } from "./Summary";
import { Game } from "..";
import {
  CafeCodeInfo,
  useWithCafeCodeExamine,
} from "./hooks/use-with-cafe-code-examine";

const GameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.CANVAS,
  title: "Bought or Not!",
  parent: "phaser-container",
  backgroundColor: "#282c34",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 150 },
    },
  },
  scene: [MainMenu, MainGame],
};

export const Cafe: Game = {
  id: "cafe",
  title: "Bought or Not!",
  activityType: "GAME",
  description:
    "You are trying to build a classifier to recommend products based on their reviews.",
  config: GameConfig,
  autocompletion: [
    {
      label: "sklearn.naive_bayes",
      type: "text",
      apply: "sklearn.naive_bayes import MultinomialNB",
      detail: "import Naive Bayes",
    },
    {
      label: "sklearn.naive_bayes",
      type: "text",
      apply: "naive_bayes = MultinomialNB()",
      detail: "create Naive Bayes model",
    },
    {
      label: "sklearn.naive_bayes",
      type: "text",
      apply: "naive_bayes.fit()",
      detail: "train Naive Bayes model",
    },
    {
      label: "sklearn.naive_bayes",
      type: "text",
      apply: "naive_bayes.predict()",
      detail: "evaluate Naive Bayes model",
    },
  ],
  improveCodeHints: [
    {
      message:
        "You are currently using a dummy classifier model, try a real one! (Naive Bayes, Logistic Regression, etc.)",
      visibility: "TRIGGERED_OR_HINT_BUTTON",
      active: (cafeCodeInfo) => {
        return (cafeCodeInfo as CafeCodeInfo).classifierModelUsed === "DUMMY";
      },
    },
    {
      message:
        "You are currently using a Hashing Vectorizer to extract your datas features, maybe try out some other methods. (TF-IDF, Vector Count, etc.)",
      visibility: "TRIGGERED_OR_HINT_BUTTON",
      active: (cafeCodeInfo) => {
        return (
          (cafeCodeInfo as CafeCodeInfo).featureExtractionUsed === "HASHING"
        );
      },
    },
    {
      message:
        "Your data is currently polluted with stopwords, it may be benifical to remove these from your dataset.",
      visibility: "TRIGGERED_OR_HINT_BUTTON",
      active: (cafeCodeInfo) => {
        return !(cafeCodeInfo as CafeCodeInfo).removesStopwords;
      },
    },
    {
      message: "Consider using TF-IDF as your feature extractor.",
      visibility: "TRIGGERED_OR_HINT_BUTTON",
      active: (cafeCodeInfo) => {
        return (
          (cafeCodeInfo as CafeCodeInfo).featureExtractionUsed ===
          "COUNT_VECTORIZER"
        );
      },
    },
    {
      message: "Consider giving the Logistical Regression model a try!",
      visibility: "TRIGGERED_OR_HINT_BUTTON",
      active: (cafeCodeInfo) => {
        return (
          (cafeCodeInfo as CafeCodeInfo).classifierModelUsed === "NAIVE_BAYES"
        );
      },
    },
    {
      message:
        "Your classifier is working very well! Do you want to submit this or keep playing with it?",
      visibility: "TRIGGERED_OR_HINT_BUTTON",
      active: () => {
        return true;
      },
    },
  ],
  simulator: new CafeSimulator(),
  summaryPanel: Summary,
  codeExamine: useWithCafeCodeExamine,
};

export default Cafe;
