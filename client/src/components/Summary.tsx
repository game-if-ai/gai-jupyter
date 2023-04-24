/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
/* eslint-disable */

import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { makeStyles } from "@mui/styles";

import {
  DialogueMessage,
  useWithDialogue,
} from "../store/dialogue/useWithDialogue";
import { AllExperimentTypes } from "../games/activity-types";
import { CafeCurrentExperimentView } from "../games/cafe/components/current-experiment-view";
import { CafePreviousExperimentsView } from "../games/cafe/components/previous-experiment-view";
import { FruitPickerCurrentExperimentView } from "../games/fruit-picker/components/current-experiment-view";
import { FruitPickerPreviousExperimentsView } from "../games/fruit-picker/components/previous-experiment-view";
import { NMTCurrentExperimentView } from "../games/neural_machine_translation/components/current-experiment-view";
import { useWithState } from "../store/state/useWithState";
import { useAppSelector } from "../store";

function Summary(props: { onSubmit: () => void }): JSX.Element {
  const { loadExperiment } = useWithState();
  const activity = useAppSelector((s) => s.state.activity!);
  const experiment = useAppSelector((s) => s.state.experiment!);
  const summary = experiment.summary;
  const previousExperiments = activity.simulator.experiments;

  const [viewPreviousExperiment, setViewPreviousExperiments] = useState(false);
  const classes = useStyles();
  const { addMessages } = useWithDialogue();

  function _setExperiment(experiment: AllExperimentTypes) {
    loadExperiment(experiment);
    setViewPreviousExperiments(false);
  }

  useEffect(() => {
    const msgs: DialogueMessage[] = [];
    if (
      experiment.activityId === "cafe" ||
      experiment.activityId === "fruitpicker"
    ) {
      if (experiment.evaluationScore <= 0.6) {
        msgs.push({
          id: "notebook",
          title: "Results Very Bad",
          text: "Something seems wrong, barely better than random. Maybe check the model training.",
          noSave: true,
        });
      } else if (experiment.evaluationScore <= 0.9) {
        msgs.push({
          id: "notebook",
          title: "Results Okay",
          text: "The classifier works! But can we do better?",
          noSave: true,
        });
      } else {
        msgs.push({
          id: "submit",
          title: "Results Very Good",
          text: "That was a good run! Do you want to submit this or tune it more?",
          noSave: true,
        });
      }
    }
    if (experiment.activityId === "neural_machine_translation") {
      if (experiment.evaluationScore < 1) {
        msgs.push({
          id: "notebook",
          title: "Incomplete",
          text: "You have not completed all the tasks for this experiment.",
          noSave: true,
        });
      } else {
        msgs.push({
          id: "submit",
          title: "Experiment Complete",
          text: "Congratulations! You have completed all the requirements for this experiment.",
          noSave: true,
        });
      }
    }
    addMessages(msgs);
  }, [summary]);

  function curExperimentView() {
    switch (experiment.activityId) {
      case "cafe":
        return (
          <CafeCurrentExperimentView
            classes={classes}
            onSubmit={props.onSubmit}
          />
        );
      case "fruitpicker":
        return (
          <FruitPickerCurrentExperimentView
            classes={classes}
            onSubmit={props.onSubmit}
          />
        );
      case "neural_machine_translation":
        return (
          <NMTCurrentExperimentView
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
      case "cafe":
        return (
          <CafePreviousExperimentsView
            classes={classes}
            setExperiment={_setExperiment}
          />
        );
      case "fruitpicker":
        return (
          <FruitPickerPreviousExperimentsView
            classes={classes}
            setExperiment={_setExperiment}
          />
        );
      case "neural_machine_translation":
        return undefined;
      default:
        return undefined;
    }
  }

  return (
    <div>
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
