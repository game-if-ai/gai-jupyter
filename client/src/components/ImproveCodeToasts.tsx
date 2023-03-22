/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useEffect, useState } from "react";
import {
  UserCodeInfo,
  useWithUserCodeExamine,
} from "../hooks/use-with-user-code-examination";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type HintVisibilityType = "TRIGGERED_ONLY" | "TRIGGERED_OR_HINT_BUTTON";

export interface ImproveCodeHint {
  message: string;
  active: (userCodeInfo: UserCodeInfo, numRuns: number) => boolean;
  visibility: HintVisibilityType;
}

const improveCodeHints: ImproveCodeHint[] = [
  {
    message:
      "You are currently using a dummy classifier model, try a real one! (Naive Bayes, Logistic Regression, etc.)",
    visibility: "TRIGGERED_OR_HINT_BUTTON",
    active: (userCodeInfo) => {
      return userCodeInfo.classifierModelUsed === "DUMMY";
    },
  },
  {
    message:
      "You are currently using a Hashing Vectorizer to extract your datas features, maybe try out some other methods. (TF-IDF, Vector Count, etc.)",
    visibility: "TRIGGERED_OR_HINT_BUTTON",
    active: (userCodeInfo) => {
      return userCodeInfo.featureExtractionUsed === "HASHING";
    },
  },
  {
    message:
      "Your data is currently polluted with stopwords, it may be benifical to remove these from your dataset.",
    visibility: "TRIGGERED_OR_HINT_BUTTON",
    active: (userCodeInfo) => {
      return !userCodeInfo.removesStopwords;
    },
  },
  {
    message: "Consider using TF-IDF as your feature extractor.",
    visibility: "TRIGGERED_OR_HINT_BUTTON",
    active: (userCodeInfo) => {
      return userCodeInfo.featureExtractionUsed === "COUNT_VECTORIZER";
    },
  },
  {
    message: "Consider giving the Logistical Regression model a try!",
    visibility: "TRIGGERED_OR_HINT_BUTTON",
    active: (userCodeInfo) => {
      return userCodeInfo.classifierModelUsed === "NAIVE_BAYES";
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
];

export function ImproveCodeToasts(props: { numCodeRuns: number }) {
  const { numCodeRuns } = props;

  const [hintDisplayed, setHintDisplayed] = useState(false);
  const [activeHintIndex, setActiveHintIndex] = useState(-1);
  const [returningToNotebook] = useState(numCodeRuns > 0); // only evaluates on initial load
  const [activeToasts, setActiveToasts] = useState<ImproveCodeHint[]>([]);
  const { userCodeInfo } = useWithUserCodeExamine();

  function toastHint() {
    let activeHintIndexCopy = activeHintIndex;
    if (activeHintIndex === -1) {
      return;
    }
    while (activeHintIndexCopy >= 0) {
      const hintToShow = improveCodeHints[activeHintIndexCopy];
      console.log(hintToShow);
      const hintAlreadyShowing = Boolean(
        activeToasts.find((toast) => toast.message === hintToShow.message)
      );
      if (!hintToShow) {
        break;
      }
      if (
        hintAlreadyShowing ||
        hintToShow.visibility !== "TRIGGERED_OR_HINT_BUTTON"
      ) {
        activeHintIndexCopy--;
        continue;
      }
      setActiveToasts((prevValue) => [...prevValue, hintToShow]);
      toast(hintToShow.message, {
        onClose: () => {
          setActiveToasts((prevValue) =>
            prevValue.filter((hint) => hint.message !== hintToShow.message)
          );
        },
      });
      break;
    }
  }

  useEffect(() => {
    if (userCodeInfo.loadStatus === "LOADING") {
      return;
    }
    const firstActiveHintIndex = improveCodeHints.findIndex((hint) =>
      hint.active(userCodeInfo, numCodeRuns)
    );
    setActiveHintIndex(firstActiveHintIndex);
    if (hintDisplayed) {
      return;
    }
    setHintDisplayed(true);
    if (!returningToNotebook) {
      return;
    }
    const hintToShow = improveCodeHints[firstActiveHintIndex];
    if (!hintToShow) {
      return;
    }
    setActiveToasts((prevValue) => [...prevValue, hintToShow]);
    toast(hintToShow.message, {
      onClose: () => {
        setActiveToasts((prevValue) =>
          prevValue.filter((hint) => hint.message !== hintToShow.message)
        );
      },
    });
  }, [userCodeInfo, hintDisplayed, numCodeRuns, returningToNotebook]);

  return {
    toastHint,
    hintsAvailable: activeHintIndex !== -1,
  };
}
