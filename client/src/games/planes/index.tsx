/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import Phaser from "phaser";
import PlaneGame from "./Game";
import { Summary } from "./components/summary";
import { Game } from "..";
import {
  PlaneCodeInfo,
  useWithPlaneCodeExamine,
} from "./hooks/use-with-plane-code-examine";
import { apply } from "../../utils";
import { ActivityID } from "../../store/simulator";

const GameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.CANVAS,
  title: "Planes, Tanks, and Automobiles",
  parent: "phaser-container",
  backgroundColor: "#282c34",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 150 },
    },
  },
  scene: [PlaneGame],
};

export const Planes: Game = {
  id: ActivityID.planes,
  title: "Planes, Tanks, and Automobiles",
  activityType: "GAME",
  gameDescription:
    "PAL the robot needs help sorting all the incoming vehicles.",
  notebookDescription:
    "Try different parameter settings for this CNN for image classification. You will receive hints on how to improve its performance as you go.",
  config: GameConfig,
  autocompletion: [
    // NAIVE BAYES
    {
      label: "from sklearn.naive_bayes import MultinomialNB",
      type: "text",
      apply,
      detail: "import Naive Bayes",
    },
    {
      label: "classifier = MultinomialNB()",
      type: "text",
      apply,
      detail: "create Naive Bayes model",
    },
    // LOGISTIC REGRESSION
    {
      label: "from sklearn.linear_model import LogisticRegression",
      type: "text",
      apply,
      detail: "import Logistic Regression",
    },
    {
      label: "classifier = LogisticRegression()",
      type: "text",
      apply,
      detail: "create Logistic Regression model",
    },
    //  HASHING
    {
      label: "from sklearn.feature_extraction.text import HashingVectorizer",
      type: "text",
      apply,
      detail: "import HashingVectorizer feature extractor",
    },
    {
      label: "vectorizer = HashingVectorizer()",
      type: "text",
      apply,
      detail: "create Hashing Vectorizer object",
    },
    //  TFIDF
    {
      label: "from sklearn.feature_extraction.text import TfidfVectorizer",
      type: "text",
      apply,
      detail: "import TFIDF feature extractor",
    },
    {
      label: "vectorizer = TfidfVectorizer()",
      type: "text",
      apply,
      detail: "create TFIDF vectorizer object",
    },
    //  COUNT
    {
      label: "from sklearn.feature_extraction.text import CountVectorizer",
      type: "text",
      apply,
      detail: "import CountVectorizer feature extractor",
    },
    {
      label: "vectorizer = CountVectorizer()",
      type: "text",
      apply,
      detail: "create CountVectorizer object",
    },
    //  general vectorizer function calls
    {
      label: "vectorizer.fit_transform()",
      type: "property",
      apply,
      detail: "",
    },
    {
      label: "vectorizer.transform()",
      type: "property",
      apply,
      detail: "",
    },
    // general classifier functions
    {
      label: "classifier.fit()",
      type: "property",
      apply,
      detail: "train Logistic Regression model",
    },
    {
      label: "classifier.predict()",
      type: "property",
      apply,
      detail: "evaluate Logistic Regression model",
    },
    {
      label: "from nltk.stem import WordNetLemmatizer",
      type: "text",
      apply,
      detail: "import lemmatizatizer",
    },
    {
      label: "lemmatizer = WordNetLemmatizer()",
      type: "text",
      apply,
      detail: "create lemmatizer object",
    },
    {
      label: "lemmatizer.lemmatize(token)",
      type: "text",
      apply,
      detail: "lemmatize",
    },
    {
      label: "from nltk.stem import PorterStemmer",
      type: "text",
      apply,
      detail: "",
    },
    {
      label: "stemmer = PorterStemmer()",
      type: "text",
      apply,
      detail: "",
    },
    {
      label: "stemmer.stem(x)",
      type: "text",
      apply,
      detail: "",
    },
  ],
  improveCodeHints: [
    {
      message: "Seems to still be improving. Maybe try training for 60 epochs.",
      conditionDescription: "30 epochs",
      visibility: "TRIGGERED_OR_HINT_BUTTON",
      active: (codeInfo) => {
        const { epochs } = codeInfo as PlaneCodeInfo;
        return epochs === 30;
      },
    },
    {
      message: "Model may be too small for further improvement.",
      conditionDescription: "tiny or small model 60 epochs",
      visibility: "TRIGGERED_OR_HINT_BUTTON",
      active: (codeInfo) => {
        const { modelSize, epochs } = codeInfo as PlaneCodeInfo;
        return epochs === 60 && (modelSize === "TINY" || modelSize === "SMALL");
      },
    },
    {
      message: "Model may be too large given the size of the training data.",
      conditionDescription: "large model 60 epochs",
      visibility: "TRIGGERED_OR_HINT_BUTTON",
      active: (codeInfo) => {
        const { modelSize, epochs } = codeInfo as PlaneCodeInfo;
        return epochs === 60 && modelSize === "LARGE";
      },
    },

    {
      message:
        "This model seems the best fit given the size of the training set. You should submit your results.",
      conditionDescription: "medium 60, has not tried large or small 60",
      visibility: "TRIGGERED_OR_HINT_BUTTON",
      active: (codeInfo, numRuns, previousExperiments) => {
        const curCodeInfo = codeInfo as PlaneCodeInfo;
        const { modelSize, epochs } = curCodeInfo;
        const triedLargeSixty = previousExperiments.some((exp) => {
          return (
            (exp.codeInfo as PlaneCodeInfo).epochs === 60 &&
            (exp.codeInfo as PlaneCodeInfo).modelSize === "LARGE"
          );
        });
        const triedSmallSixty = previousExperiments.some((exp) => {
          return (
            (exp.codeInfo as PlaneCodeInfo).epochs === 60 &&
            (exp.codeInfo as PlaneCodeInfo).modelSize === "SMALL"
          );
        });
        return (
          epochs === 60 &&
          modelSize === "MEDIUM" &&
          triedLargeSixty &&
          triedSmallSixty
        );
      },
    },
    {
      message:
        "Pretty good results. You should try the large model to see if you can get better.",
      conditionDescription: "medium 60, has not tried large 60",
      visibility: "TRIGGERED_OR_HINT_BUTTON",
      active: (codeInfo, numRuns, previousExperiments) => {
        const curCodeInfo = codeInfo as PlaneCodeInfo;
        const { modelSize, epochs } = curCodeInfo;
        const triedLargeSixty = previousExperiments.some((exp) => {
          return (
            (exp.codeInfo as PlaneCodeInfo).epochs === 60 &&
            (exp.codeInfo as PlaneCodeInfo).modelSize === "LARGE"
          );
        });
        return epochs === 60 && modelSize === "MEDIUM" && !triedLargeSixty;
      },
    },
    {
      message:
        "Pretty good results. You should try the small model to see if it generalizes better.",
      conditionDescription: "medium 60, has not tried small 60",
      visibility: "TRIGGERED_OR_HINT_BUTTON",
      active: (codeInfo, numRuns, previousExperiments) => {
        const curCodeInfo = codeInfo as PlaneCodeInfo;
        const { modelSize, epochs } = curCodeInfo;
        const triedSmallSixty = previousExperiments.some((exp) => {
          return (
            (exp.codeInfo as PlaneCodeInfo).epochs === 60 &&
            (exp.codeInfo as PlaneCodeInfo).modelSize === "SMALL"
          );
        });
        return epochs === 60 && modelSize === "MEDIUM" && !triedSmallSixty;
      },
    },

    {
      message: "Make sure you're using the specified values for the system.",
      conditionDescription: "ensure correct values",

      visibility: "TRIGGERED_OR_HINT_BUTTON",
      active: (codeInfo) => {
        const { modelSize, epochs } = codeInfo as PlaneCodeInfo;
        return (
          (epochs !== 30 && epochs !== 60) ||
          (modelSize !== "TINY" &&
            modelSize !== "SMALL" &&
            modelSize !== "MEDIUM" &&
            modelSize !== "LARGE")
        );
      },
    },
    {
      message:
        "That was a good run! Do you want to submit this or tune it more?",
      conditionDescription: "always true",
      visibility: "TRIGGERED_OR_HINT_BUTTON",
      active: () => {
        return true;
      },
    },
  ],
  summaryPanel: Summary,
  codeExamine: useWithPlaneCodeExamine,
};

export default Planes;
