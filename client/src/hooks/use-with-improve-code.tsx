/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAppSelector } from "../store";
import { Activity, CodeInfo, Experiment } from "store/simulator";
type HintVisibilityType = "TRIGGERED_ONLY" | "TRIGGERED_OR_HINT_BUTTON";

export interface ImproveCodeHint {
  message: string;
  active: (
    codeInfo: CodeInfo,
    numRuns: number,
    previousExperiments: Experiment[]
  ) => boolean;
  conditionDescription: string;
  visibility: HintVisibilityType;
}

export interface UseWithImproveCode {
  toastHint: () => void;
  hintsAvailable: boolean;
  getDisplayedHints: () => ImproveCodeHint[];
}

export function useWithImproveCode(props: {
  userCode: Record<string, string[]>;
  validationCellOutput: any[];
  activeActivity: Activity;
  notebookRunCount: number;
}): UseWithImproveCode {
  const activity = useAppSelector((s) => s.state.activity!);
  const previousExperiments = useAppSelector(
    (state) => state.simulator.experiments[activity.id]
  );
  const isRunning = useAppSelector((s) => s.notebookState.isRunning);
  const { activeActivity, userCode, validationCellOutput, notebookRunCount } =
    props;
  const timesNotebookVisited = useAppSelector(
    (s) => s.state.timesNotebookVisited
  );
  const [hintDisplayed, setHintDisplayed] = useState(false);
  const [activeHintIndex, setActiveHintIndex] = useState(-1);
  const [activeToasts, setActiveToasts] = useState<ImproveCodeHint[]>([]);
  const { codeInfo, loadStatus: codeInfoLoadStatus } =
    activeActivity.codeExamine(
      userCode,
      validationCellOutput,
      notebookRunCount
    );
  const { improveCodeHints } = activeActivity;

  function toastHint() {
    let activeHintIndexCopy = activeHintIndex;
    if (activeHintIndex === -1) {
      return;
    }

    while (activeHintIndexCopy >= 0) {
      const hintToShow = improveCodeHints[activeHintIndexCopy];
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
      // hintDisplayedCmi5(hintToShow, activeActivity.id);
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

  function getDisplayedHints() {
    const displayedHints = improveCodeHints.filter(
      (hint) => !hint.active(codeInfo, 0, previousExperiments)
    ); //inactive hints mean they are already satisfied
    const currentlyActiveHint = improveCodeHints.find((hint) =>
      hint.active(codeInfo, 0, previousExperiments)
    );
    return [
      ...displayedHints,
      ...(currentlyActiveHint ? [currentlyActiveHint] : []),
    ];
  }

  useEffect(() => {
    if (codeInfoLoadStatus === "LOADING" || isRunning) {
      return;
    }
    const firstActiveHintIndex = improveCodeHints.findIndex((hint) =>
      hint.active(codeInfo, 0, previousExperiments)
    );
    setActiveHintIndex(firstActiveHintIndex);
    if (hintDisplayed) {
      return;
    }
    setHintDisplayed(true);
    if (!(timesNotebookVisited > 1)) {
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
  }, [
    codeInfo, //most important
    codeInfoLoadStatus,
    hintDisplayed,
    timesNotebookVisited,
    activeActivity.id,
    improveCodeHints,
    isRunning,
    previousExperiments,
  ]);

  return {
    toastHint,
    hintsAvailable: activeHintIndex !== -1,
    getDisplayedHints,
  };
}
