/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import React, { useEffect, useState } from "react";
import makeStyles from "@mui/styles/makeStyles";
import Cmi5 from "@xapi/cmi5";

import { Activities, Activity, isGameActivity } from "./games";
import ActivityPicker from "./components/ActivityPicker";
import Notebook from "./components/Notebook";
import SimulationPanel from "./components/SimulationPanel";
import Summary from "./components/Summary";
import { sessionStorageStore } from "./local-storage";
import { ContentsManager } from "@jupyterlab/services";
import { getUniqueUserId } from "./utils";
import { TEMP_NOTEBOOK_DIR } from "./local-constants";
import {
  AllExperimentTypes,
  GameExperimentTypes,
} from "./games/activity-types";
import { CircularProgress } from "@mui/material";

enum STEP {
  PICK_GAME,
  NOTEBOOK,
  SIMULATION, // for current experiment
  SUMMARY, // for current experiment
  EXPERIMENTS, // experiment history
}

function App(): JSX.Element {
  const classes = useStyles();
  const [step, setStep] = useState<STEP>(STEP.PICK_GAME);
  const [activity, setActivity] = useState<Activity>();
  const [experiment, setExperiment] = useState<AllExperimentTypes>();
  const [simulation, setSimulation] = useState<number>(0);
  const [timesNotebookVisited, setTimesNotebookVisited] = useState(0);
  const [uniqueUserId, setUniqueUserId] = useState("");
  const [notebooksCreated, setNotebooksCreated] = useState(false);

  useEffect(() => {
    if (step === STEP.NOTEBOOK) {
      setTimesNotebookVisited((prevValue) => prevValue + 1);
    }
  }, [step]);

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
  }, []);

  useEffect(() => {
    if (Cmi5.isCmiAvailable) {
      Cmi5.instance.initialize();
    } else {
      try {
        Cmi5.instance.getLaunchParameters();
      } catch (err) {
        console.log("cmi5 not available");
      }
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
              scaled: experimentScore,
            },
          },
        };
      },
    });
  }

  function loadActivity(activity: Activity): void {
    setActivity(activity);
    setStep(STEP.NOTEBOOK);
  }

  function viewSimulation(i: number): void {
    if (!activity) {
      return;
    }
    setSimulation(i);
    setStep(STEP.SIMULATION);
  }

  function viewSummary(): void {
    if (!activity) {
      return;
    }
    setStep(STEP.SUMMARY);
  }

  function viewNotebook(): void {
    setStep(STEP.NOTEBOOK);
  }

  function getComponent(): JSX.Element {
    if (step === STEP.PICK_GAME) {
      return <ActivityPicker loadActivity={loadActivity} />;
    } else if (step === STEP.NOTEBOOK) {
      if (!notebooksCreated) {
        return <CircularProgress />;
      }
      return (
        <Notebook
          uniqueUserId={uniqueUserId}
          activity={activity!}
          curExperiment={experiment}
          setExperiment={setExperiment}
          viewSummary={viewSummary}
          runSimulation={viewSimulation}
          timesNotebookVisited={timesNotebookVisited}
        />
      );
    } else if (step === STEP.SUMMARY) {
      if (!activity) {
        throw Error("No game available for summary");
      }
      if (!experiment) {
        throw Error("No experiment available for summary");
      }
      return (
        <Summary
          experiment={experiment}
          isGameActivity={isGameActivity(activity)}
          previousExperiments={activity.simulator.experiments}
          runSimulation={viewSimulation}
          goToNotebook={viewNotebook}
          setExperiment={setExperiment}
          onSubmit={sendCmi5Results}
        />
      );
    } else if (
      step === STEP.SIMULATION &&
      activity &&
      experiment &&
      isGameActivity(activity)
    ) {
      return (
        <SimulationPanel
          game={activity}
          experiment={experiment as GameExperimentTypes}
          simulation={simulation}
          toNotebook={viewNotebook}
          toSummary={viewSummary}
        />
      );
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
