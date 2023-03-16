/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import React, { useEffect, useState } from "react";
import makeStyles from "@mui/styles/makeStyles";

import { Experiment, Simulation } from "./games/simulator";
import { Game } from "./games";
import GamePicker from "./components/GamePicker";
import Notebook from "./components/Notebook";
import SimulationPanel from "./components/SimulationPanel";
import Summary from "./components/Summary";
import Cmi5 from "@xapi/cmi5";

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
  const [game, setGame] = useState<Game>();
  const [experiment, setExperiment] = useState<Experiment<Simulation>>();
  const [simulation, setSimulation] = useState<number>(0);

  useEffect(() => {
    if (Cmi5.isCmiAvailable) {
      console.log("cmi5 available");
      Cmi5.instance.initialize();
    } else {
      try {
        Cmi5.instance.getLaunchParameters();
      } catch (err) {
        console.error("cmi5 not available", err);
      }
    }
  }, [game]);

  async function sendCmi5Results(): Promise<void> {
    if (!Cmi5.isCmiAvailable) {
      console.log("cmi5 not available to send results");
      return;
    }

    Cmi5.instance.complete({
      transform: (s) => {
        return {
          ...s,
          result: {
            score: { scaled: experiment?.summary.averageF1Score || 0 },
          },
        };
      },
    });
  }

  function loadGame(game: Game): void {
    setGame(game);
    setStep(STEP.NOTEBOOK);
  }

  function viewExperiment(e: number): void {
    if (!game || game.simulator.experiments.length < e - 1) {
      return;
    }
    setExperiment(game.simulator.experiments[e]);
  }

  function viewSimulation(i: number): void {
    if (!game) {
      return;
    }
    setSimulation(i);
    setStep(STEP.SIMULATION);
  }

  function viewSummary(): void {
    if (!game) {
      return;
    }
    setStep(STEP.SUMMARY);
  }

  function viewNotebook(): void {
    setStep(STEP.NOTEBOOK);
  }

  function getComponent(): JSX.Element {
    if (step === STEP.PICK_GAME) {
      return <GamePicker loadGame={loadGame} />;
    } else if (step === STEP.NOTEBOOK) {
      return (
        <Notebook
          game={game!}
          curExperiment={experiment}
          setExperiment={viewExperiment}
          viewSummary={viewSummary}
          runSimulation={viewSimulation}
        />
      );
    } else if (step === STEP.SUMMARY) {
      if (!game) {
        throw Error("No game available for summary");
      }
      if (!experiment) {
        throw Error("No experiment available for summary");
      }
      return (
        <Summary
          experiment={experiment}
          previousExperiments={game.simulator.experiments}
          runSimulation={viewSimulation}
          goToNotebook={viewNotebook}
          setExperiment={setExperiment}
          onSubmit={sendCmi5Results}
        />
      );
    } else if (step === STEP.SIMULATION) {
      return (
        <SimulationPanel
          game={game!}
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
