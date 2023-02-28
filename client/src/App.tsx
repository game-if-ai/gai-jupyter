/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import React, { useState } from "react";
import makeStyles from "@mui/styles/makeStyles";

import { Classifier } from "./classifier";
import { Simulation, SimulationSummary } from "./simulator";
import { Game } from "./games";
import GamePicker from "./components/GamePicker";
import Notebook from "./components/Notebook";
import SimulationPanel from "./components/SimulationPanel";
import Summary from "./components/Summary";

enum STEP {
  PICK_GAME,
  NOTEBOOK,
  SIMULATION,
  SUMMARY,
}

function App(): JSX.Element {
  const classes = useStyles();
  const [step, setStep] = useState<STEP>(STEP.PICK_GAME);
  const [game, setGame] = useState<Game>();
  const [classifier, setClassifier] = useState<Classifier>();
  const [summary, setSummary] = useState<SimulationSummary>();
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [simulation, setSimulation] = useState<number>(0);

  function loadGame(game: Game): void {
    setGame(game);
    setStep(STEP.NOTEBOOK);
  }

  function onSimulate(c: Classifier): void {
    if (!game) {
      return;
    }
    setClassifier(c);
    setSimulations([...game.simulator.simulations]);
    setSummary({ ...game.simulator.summary });
    setStep(STEP.SUMMARY);
  }

  function viewSimulation(i: number): void {
    setSimulation(i);
    setStep(STEP.SIMULATION);
  }

  function viewSummary(): void {
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
        <Notebook game={game!} classifier={classifier} simulate={onSimulate} />
      );
    } else if (step === STEP.SUMMARY) {
      return (
        <Summary
          summary={summary!}
          simulations={simulations}
          runSimulation={viewSimulation}
        />
      );
    } else if (step === STEP.SIMULATION) {
      return (
        <SimulationPanel
          game={game!}
          simulations={simulations}
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
    margin: 20,
    width: "100%",
    height: "100%",
    display: "flex",
    flexFlow: "column",
    textAlign: "center",
    alignContent: "center",
    alignItems: "center",
    justifyItems: "center",
    justifyContent: "center",
  },
}));

export default App;
