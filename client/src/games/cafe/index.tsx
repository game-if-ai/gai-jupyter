/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import Phaser from "phaser";
import CafeGame from "./Game";
import { Summary } from "./components/summary";
import { Game } from "..";
import {
  CafeCodeInfo,
  useWithCafeCodeExamine,
} from "./hooks/use-with-cafe-code-examine";
import { apply } from "../../utils";
import { ActivityID } from "../../store/simulator";

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
  scene: [CafeGame],
};

export const Cafe: Game = {
  id: ActivityID.cafe,
  title: "Bought or Not!",
  activityType: "GAME",
  gameDescription:
    "PAL the robot is sorting products based on customer feedback, and they need your help! Based on the review, should the product be Bought or Not? Train PAL's AI by completing a notebook to build a sentiment classifier.",
  notebookDescription:
    "Please complete this notebook to build a sentiment classifier. You will receive hints on how to improve its performance as you go.",
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
    {
      label: "from nltk.corpus import stopwords",
      type: "text",
      apply,
      detail: "",
    },
  ],
  improveCodeHints: [
    {
      message:
        "You are currently using a dummy classifier model, try a real one! (Naive Bayes, Logistic Regression, etc.)",
      visibility: "TRIGGERED_OR_HINT_BUTTON",
      conditionDescription:
        "Checks if the user is still using the dummy classifier.",
      active: (cafeCodeInfo) => {
        return (cafeCodeInfo as CafeCodeInfo).classifierModelUsed === "DUMMY";
      },
    },
    {
      message: "Consider giving the Naive Bayes model a try!",
      visibility: "TRIGGERED_OR_HINT_BUTTON",
      conditionDescription:
        "Checks if the user is still using the dummy classifier.",
      active: (cafeCodeInfo) => {
        return (cafeCodeInfo as CafeCodeInfo).classifierModelUsed === "DUMMY";
      },
    },
    {
      message: "Consider preprocessing your data with stemming!",
      conditionDescription: "Checks that the user is stemming their data.",
      visibility: "TRIGGERED_OR_HINT_BUTTON",
      active(cafeCodeInfo) {
        const { usingStemming } = cafeCodeInfo as CafeCodeInfo;
        return !usingStemming;
      },
    },
    {
      message: "Consider giving a Logistic Regression model a try!",
      conditionDescription: "Checks if the user is using a Naive Bayes model",
      visibility: "TRIGGERED_OR_HINT_BUTTON",
      active(cafeCodeInfo) {
        const { classifierModelUsed } = cafeCodeInfo as CafeCodeInfo;
        return classifierModelUsed === "NAIVE_BAYES";
      },
    },

    {
      message: "Try removing stopwords.",
      conditionDescription: "Check if the user is removing stopwords",
      visibility: "TRIGGERED_OR_HINT_BUTTON",
      active(cafeCodeInfo) {
        const { classifierModelUsed, usingStemming, removesStopwords } =
          cafeCodeInfo as CafeCodeInfo;
        return (
          classifierModelUsed === "LOGISTIC_REGRESSION" &&
          usingStemming &&
          !removesStopwords
        );
      },
    },

    {
      message:
        "Your classifier is working very well! Do you want to submit this or keep playing with it?",
      conditionDescription: "always true",

      visibility: "TRIGGERED_OR_HINT_BUTTON",
      active: () => {
        return true;
      },
    },
  ],
  summaryPanel: Summary,
  codeExamine: useWithCafeCodeExamine,
};

export default Cafe;
