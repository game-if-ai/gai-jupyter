/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import React, { useEffect, useState } from "react";
import { ContentsManager } from "@jupyterlab/services";
import { CircularProgress } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import Cmi5 from "@xapi/cmi5";

import ActivityPicker from "./components/ActivityPicker";
import Notebook from "./components/Notebook";
import SimulationPanel from "./components/SimulationPanel";
import Summary from "./components/Summary";
import { Activities, isGameActivity } from "./games";
import { TEMP_NOTEBOOK_DIR } from "./local-constants";
import { sessionStorageStore } from "./local-storage";
import { STEP } from "./store/state";
import { useAppSelector } from "./store";
import { useWithState } from "./store/state/useWithState";
import { getUniqueUserId } from "./utils";

function App(): JSX.Element {
  const classes = useStyles();
  const [uniqueUserId, setUniqueUserId] = useState("");
  const [notebooksCreated, setNotebooksCreated] = useState(false);

  const activity = useAppSelector((s) => s.state.activity);
  const experiment = useAppSelector((s) => s.state.experiment);
  const step = useAppSelector((s) => s.state.step);
  const { loadActivity } = useWithState();

  useEffect(() => {
    const uniqueId = getUniqueUserId();
    setUniqueUserId(uniqueId);
    const cm = new ContentsManager();
    const removeOldFiles = Activities.map((activity) => {
      return cm.delete(
        `/${TEMP_NOTEBOOK_DIR}/${uniqueId}/${activity.id}/test.ipynb`
      );
    });
    Promise.all(removeOldFiles);
    cm.save(`/${TEMP_NOTEBOOK_DIR}/`, { type: "directory" }).then(() => {
      cm.save(`/${TEMP_NOTEBOOK_DIR}/${uniqueId}/`, { type: "directory" }).then(
        () => {
          const notebookCreationPromises = [
            // Create directories
            ...Activities.map(async (activity) => {
              return await cm.save(
                `/${TEMP_NOTEBOOK_DIR}/${uniqueId}/${activity.id}/`,
                {
                  type: "directory",
                }
              );
            }),
            // Copy files into directories
            ...Activities.map(async (activity) => {
              return await cm.copy(
                `/${activity.id}/test.ipynb`,
                `/${TEMP_NOTEBOOK_DIR}/${uniqueId}/${activity.id}/test.ipynb`
              );
            }),
          ];

          Promise.all(notebookCreationPromises).finally(() => {
            setNotebooksCreated(true);
          });
        }
      );
    });
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const walkthroughParam = queryParams.get("walkthrough");
    if (walkthroughParam) {
      sessionStorageStore("show_walkthrough", "true");
    }
    const activityParam = queryParams.get("activity");
    if (activityParam) {
      const activity = Activities.find((g) => g.id === activityParam);
      if (activity) {
        loadActivity(activity);
      }
    }
  });

  useEffect(() => {
    if (Cmi5.isCmiAvailable) {
      Cmi5.instance.initialize();
    } else {
      console.log("cmi5 not available");
    }
  }, [activity]);

  function sendCmi5Results(): void {
    if (!experiment) {
      console.log("no experiment to evaluate");
      return;
    }
    const experimentScore = experiment.evaluationScore;
    if (!Cmi5.isCmiAvailable) {
      console.log(
        "cmi5 not available to send results",
        `Score: ${experimentScore}`
      );
      return;
    }
    Cmi5.instance.complete({
      transform: (s) => {
        return {
          ...s,
          result: {
            score: {
              scaled: experimentScore > 1 ? 1 : experimentScore,
            },
          },
        };
      },
    });
  }

  function getComponent(): JSX.Element {
    if (step === STEP.PICK_GAME) {
      return <ActivityPicker />;
    } else if (step === STEP.NOTEBOOK) {
      if (!notebooksCreated) {
        return <CircularProgress />;
      }
      return <Notebook uniqueUserId={uniqueUserId} />;
    } else if (step === STEP.SUMMARY) {
      if (!activity) {
        throw Error("No game available for summary");
      }
      if (!experiment) {
        throw Error("No experiment available for summary");
      }
      return <Summary onSubmit={sendCmi5Results} />;
    } else if (
      step === STEP.SIMULATION &&
      activity &&
      experiment &&
      isGameActivity(activity)
    ) {
      return <SimulationPanel />;
    }
    return <div />;
  }

  return <div className={classes.root}>{getComponent()}</div>;
}

const useStyles = makeStyles(() => ({
  root: {
    width: "100%",
    height: "100%",
    textAlign: "center",
    alignContent: "center",
    alignItems: "center",
    justifyItems: "center",
    justifyContent: "center",
  },
}));

export default App;
