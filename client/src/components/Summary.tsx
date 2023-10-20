/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
/* eslint-disable */

import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { makeStyles } from "@mui/styles";

import { CafeCurrentExperimentView } from "../games/cafe/components/current-experiment-view";
import { CafePreviousExperimentsView } from "../games/cafe/components/previous-experiment-view";
import { FruitPickerCurrentExperimentView } from "../games/fruit-picker/components/current-experiment-view";
import { FruitPickerPreviousExperimentsView } from "../games/fruit-picker/components/previous-experiment-view";
import { NMTCurrentExperimentView } from "../games/neural_machine_translation/components/current-experiment-view";
import { PlaneCurrentExperimentView } from "../games/planes/components/current-experiment-view";
import { PlanePreviousExperimentsView } from "../games/planes/components/previous-experiment-view";
import { useAppSelector } from "../store";
import { ActivityID, Experiment } from "../store/simulator";
import { useWithState } from "../store/state/useWithState";
import {
  DialogueMessage,
  useWithDialogue,
} from "../store/dialogue/useWithDialogue";
import { PlaneCodeInfo } from "games/planes/hooks/use-with-plane-code-examine";
import Planes from "../games/planes";

function Summary(props: { onSubmit: () => void }): JSX.Element {
  const { loadExperiment } = useWithState();
  const activity = useAppSelector((s) => s.state.activity!);
  const experiment: Experiment = useAppSelector((s) => s.state.experiment!);
  const previousExperiments = useAppSelector(
    (s) => s.simulator.experiments[activity.id]
  );
  const numRuns = previousExperiments.length;
  const summary = experiment.summary;

  const [viewPreviousExperiment, setViewPreviousExperiments] = useState(false);
  const classes = useStyles();
  const { addMessage } = useWithDialogue();

  function _setExperiment(experiment: Experiment) {
    loadExperiment(experiment);
    setViewPreviousExperiments(false);
  }

  useEffect(() => {
    const msgs: DialogueMessage[] = [];
    if (experiment.activityId === ActivityID.nmt) {
      if (experiment.evaluationScore < 1) {
        addMessage(
          {
            id: "notebook",
            title: "Incomplete",
            text: "You have not completed all the tasks for this experiment.",
            noSave: true,
          },
          true
        );
      } else {
        addMessage(
          {
            id: "submit",
            title: "Experiment Complete",
            text: "Congratulations! You have completed all the requirements for this experiment.",
            noSave: true,
          },
          true
        );
      }
    } else if (experiment.activityId === ActivityID.planes) {
      const codeInfo = experiment.codeInfo as PlaneCodeInfo;
      const firstActiveHint = Planes.improveCodeHints.find((hint) =>
        hint.active(codeInfo, numRuns, previousExperiments)
      );
      if (firstActiveHint) {
        addMessage(
          {
            id: "notebook",
            title: "Feedback",
            text: firstActiveHint.message,
            noSave: true,
          },
          true
        );
        return;
      }
    } else {
      if (experiment.evaluationScore <= 0.6) {
        addMessage(
          {
            id: "notebook",
            title: "Results Very Bad",
            text: "Something seems wrong, barely better than random. Maybe check the model training.",
            noSave: true,
          },
          true
        );
      } else if (experiment.evaluationScore <= 0.9) {
        addMessage(
          {
            id: "notebook",
            title: "Results Okay",
            text: "The classifier works! But can we do better?",
            noSave: true,
          },
          true
        );
      } else {
        addMessage(
          {
            id: "submit",
            title: "Results Very Good",
            text: "That was a good run! Do you want to submit this or tune it more?",
            noSave: true,
          },
          true
        );
      }
    }
  }, [summary]);

  function curExperimentView() {
    switch (experiment.activityId) {
      case ActivityID.cafe:
        return (
          <CafeCurrentExperimentView
            classes={classes}
            onSubmit={props.onSubmit}
          />
        );
      case ActivityID.fruit:
        return (
          <FruitPickerCurrentExperimentView
            classes={classes}
            onSubmit={props.onSubmit}
          />
        );
      case ActivityID.nmt:
        return (
          <NMTCurrentExperimentView
            classes={classes}
            onSubmit={props.onSubmit}
          />
        );
      case ActivityID.planes:
        return (
          <PlaneCurrentExperimentView
            classes={classes}
            onSubmit={props.onSubmit}
          />
        );
      default:
        return <div />;
    }
  }

  function previousExperimentView(): JSX.Element | undefined {
    switch (experiment.activityId) {
      case ActivityID.cafe:
        return (
          <CafePreviousExperimentsView
            classes={classes}
            setExperiment={_setExperiment}
          />
        );
      case ActivityID.fruit:
        return (
          <FruitPickerPreviousExperimentsView
            classes={classes}
            setExperiment={_setExperiment}
          />
        );
      case ActivityID.nmt:
        return undefined;
      case ActivityID.planes:
        return (
          <PlanePreviousExperimentsView
            classes={classes}
            setExperiment={_setExperiment}
          />
        );
      default:
        return undefined;
    }
  }

  return (
    <div data-cy="summary-root">
      {previousExperiments.length > 0 && Boolean(previousExperimentView()) ? (
        <Button
          onClick={() => setViewPreviousExperiments((prevValue) => !prevValue)}
        >
          {viewPreviousExperiment
            ? "view current experiment"
            : "view Previous Experiments"}
        </Button>
      ) : undefined}
      {viewPreviousExperiment ? previousExperimentView() : curExperimentView()}
    </div>
  );
}

const useStyles = makeStyles({
  sticky: {
    position: "sticky",
    background: "white",
    right: 0,
  },
});

export default Summary;
