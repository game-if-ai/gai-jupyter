/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAppSelector } from "../store";
import { Activity, CodeInfo, Experiment } from "store/simulator";
import { useWithExperimentsStore } from "./use-with-experiments-store";
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
  validationCellOutput: string[] | string;
  activeActivity: Activity;
  notebookRunCount: number;
}): UseWithImproveCode {
  const activity = useAppSelector((s) => s.state.activity!);
  const { getPastExperiments } = useWithExperimentsStore();
  const previousExperiments = getPastExperiments(activity.id);
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

  /**
   * Gets next improveCodeHints that is not already showing and is active
   */
  function getNextHintToShow(
    startingPos?: number
  ): ImproveCodeHint | undefined {
    let nextHintIndex = startingPos || 0;
    if (nextHintIndex >= improveCodeHints.length) {
      return undefined;
    }
    let hintToShow: ImproveCodeHint | undefined =
      improveCodeHints[nextHintIndex];
    if (!hintToShow) {
      return undefined;
    }
    let hintAlreadyShowing = Boolean(
      activeToasts.find((toast) => toast.message === hintToShow?.message)
    );
    if (
      hintAlreadyShowing ||
      hintToShow.visibility !== "TRIGGERED_OR_HINT_BUTTON"
    ) {
      hintToShow = improveCodeHints.slice(nextHintIndex).find((hint) => {
        return (
          hint.active(codeInfo, 0, previousExperiments) &&
          !Boolean(activeToasts.find((toast) => toast.message === hint.message))
        );
      });
    }
    return hintToShow;
  }

  function toastHint() {
    if (activeHintIndex === -1) {
      return;
    }
    let hintToShow: ImproveCodeHint | undefined =
      improveCodeHints[activeHintIndex];
    let hintAlreadyShowing = Boolean(
      activeToasts.find((toast) => toast.message === hintToShow?.message)
    );
    if (!hintToShow) {
      // issue with activeHintIndex
      return;
    }
    if (
      hintAlreadyShowing ||
      hintToShow.visibility !== "TRIGGERED_OR_HINT_BUTTON"
    ) {
      // get next active hint to show (that comes after current hint)
      hintToShow = getNextHintToShow(activeHintIndex + 1);
    }
    if (!hintToShow) {
      return;
    }
    setActiveToasts((prevValue) => [...prevValue, hintToShow!]);
    toast(hintToShow.message, {
      onClose: () => {
        setActiveToasts((prevValue) =>
          prevValue.filter((hint) => hint.message !== hintToShow!.message)
        );
      },
    });
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
      hint.active(codeInfo, previousExperiments.length, previousExperiments)
    );
    if (firstActiveHintIndex === -1) {
      return;
    }
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
    codeInfo,
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
