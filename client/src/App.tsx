/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import React, { useEffect, useState } from "react";
import makeStyles from "@mui/styles/makeStyles";
import Cmi5 from "@xapi/cmi5";

import { Activities, Activity, isGameActivity } from "./games";
import { Experiment, Simulation } from "./games/simulator";
import ActivityPicker from "./components/ActivityPicker";
import Notebook from "./components/Notebook";
import SimulationPanel from "./components/SimulationPanel";
import Summary from "./components/Summary";
import { sessionStorageStore } from "./local-storage";
import { evaluteExperiment } from "./score-evaluation";
import { ContentsManager } from "@jupyterlab/services";
import { newUuid } from "@datalayer/jupyter-react";

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
  const [experiment, setExperiment] = useState<Experiment<Simulation>>();
  const [simulation, setSimulation] = useState<number>(0);
  const [numRuns, setNumRuns] = useState(0);
  const [uniqueUserId, setUniqueUserId] = useState("");

  useEffect(() => {
    const uniqueId = newUuid();
    setUniqueUserId(uniqueId);
    const cm = new ContentsManager();

    cm.save(`/${uniqueId}/`, { type: "directory" }).then(() => {
      Activities.forEach((activity) => {
        cm.save(`/${uniqueId}/${activity.id}/`, { type: "directory" }).then(
          () => {
            cm.copy(
              `/${activity.id}/test.ipynb`,
              `/${uniqueId}/${activity.id}/test.ipynb`
            );
          }
        );
      });
    });

    return () => {
      Activities.forEach((activity) => {
        cm.delete(`/${uniqueId}/${activity.id}/test.ipynb`);
      });
    };
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
    const experimentScore = evaluteExperiment(experiment);
    if (!Cmi5.isCmiAvailable) {
      console.log("cmi5 not available to send results");
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

  function notebookRan() {
    setNumRuns((prevValue) => prevValue + 1);
  }

  function viewExperiment(e: number): void {
    if (!activity || activity.simulator.experiments.length < e - 1) {
      return;
    }
    setExperiment(activity.simulator.experiments[e]);
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
      return (
        <Notebook
          uniqueUserId={uniqueUserId}
          activity={activity!}
          curExperiment={experiment}
          setExperiment={viewExperiment}
          viewSummary={viewSummary}
          runSimulation={viewSimulation}
          notebookRan={notebookRan}
          numRuns={numRuns}
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
      isGameActivity(activity)
    ) {
      return (
        <SimulationPanel
          game={activity}
          experiment={experiment!}
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
