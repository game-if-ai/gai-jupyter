/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
/* eslint-disable */

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
import useWithIndexDb from "./store/use-with-index-db";

function App(): JSX.Element {
  const classes = useStyles();
  const [notebooksCreated, setNotebooksCreated] = useState(false);
  const { activity, experiment, step, uniqueUserId } = useAppSelector(
    (s) => s.state
  );
  const { loadActivity, toNotebook } = useWithState();
  useWithIndexDb();
  useEffect(() => {
    const cm = new ContentsManager();
    try {
      const removeOldFiles = Activities.map((activity) => {
        return cm.delete(
          `/${TEMP_NOTEBOOK_DIR}/${uniqueUserId}/${activity.id}/test2.ipynb`
        );
      });
      Promise.all(removeOldFiles).catch((err) => {
        console.log(`Error deleting old files: ${err}`);
      });
      cm.save(`/${TEMP_NOTEBOOK_DIR}/`, { type: "directory" }).then(() => {
        cm.save(`/${TEMP_NOTEBOOK_DIR}/${uniqueUserId}/`, {
          type: "directory",
        }).then(() => {
          const notebookCreationPromises = [
            // Create directories
            ...Activities.map(async (activity) => {
              return await cm.save(
                `/${TEMP_NOTEBOOK_DIR}/${uniqueUserId}/${activity.id}/`,
                {
                  type: "directory",
                }
              );
            }),
            // Copy files into directories
            ...Activities.map(async (activity) => {
              return await cm.copy(
                `/${activity.id}/test2.ipynb`,
                `/${TEMP_NOTEBOOK_DIR}/${uniqueUserId}/${activity.id}/test2.ipynb`
              );
            }),
          ];
          Promise.all(notebookCreationPromises).finally(() => {
            setNotebooksCreated(true);
          });
        });
      });
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const walkthroughParam = queryParams.get("walkthrough");
    if (walkthroughParam) {
      sessionStorageStore("show_walkthrough", "true");
    }
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const activityParam = queryParams.get("activity");
    if (activityParam) {
      const activity = Activities.find((g) => g.id === activityParam);
      if (activity && step === STEP.PICK_GAME) {
        loadActivity(activity);
        toNotebook();
      }
    }
  }, [loadActivity, step]);

  useEffect(() => {
    if (Cmi5.isCmiAvailable) {
      Cmi5.instance.initialize();
    }
  }, [activity]);

  function sendCmi5Results(): void {
    if (!experiment) {
      return;
    }
    const experimentScore = experiment.evaluationScore;
    if (!Cmi5.isCmiAvailable) {
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

  return (
    <div data-cy="root" data-test={step} className={classes.root}>
      {getComponent()}
    </div>
  );
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
