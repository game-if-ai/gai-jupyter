/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useState } from "react";
import makeStyles from "@mui/styles/makeStyles";

import { Classifier, ClassifierInput, ClassifierOutput } from "./classifier";
import { SimulationOutput, SimulationSummary, Simulator } from "./simulator";
import GamePicker from "./components/GamePicker";
import Notebook from "./components/Notebook";
import SimulationPanel from "./components/SimulationPanel";
import Summary from "./components/Summary";

import "./App.css";

enum STEP {
  PICK_GAME,
  NOTEBOOK,
  SIMULATION,
  SUMMARY,
}

function App(): JSX.Element {
  const classes = useStyles();
  const [step, setStep] = useState<STEP>(STEP.PICK_GAME);
  const [game, setGame] = useState<Phaser.Types.Core.GameConfig>();
  const [classifier, setClassifier] =
    useState<Classifier<ClassifierInput, ClassifierOutput>>();
  const [simulator, setSimulator] =
    useState<
      Simulator<SimulationOutput, Classifier<ClassifierInput, ClassifierOutput>>
    >();
  const [simulations, setSimulations] = useState<SimulationOutput[]>([]);
  const [summary, setSummary] = useState<SimulationSummary>();
  const [simulation, setSimulation] = useState<number>(0);

  function loadGame(
    config: Phaser.Types.Core.GameConfig,
    classifier: Classifier<ClassifierInput, ClassifierOutput>,
    simulator: Simulator<
      SimulationOutput,
      Classifier<ClassifierInput, ClassifierOutput>
    >
  ): void {
    setGame(config);
    setClassifier(classifier);
    setSimulator(simulator);
    setStep(STEP.NOTEBOOK);
  }

  function simulateGame(runs: number): void {
    if (!simulator) {
      return;
    }
    simulator.simulate(runs);
    setSimulations([...simulator.simulations]);
    setSummary({ ...simulator.summary });
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
      return <Notebook classifier={classifier!} simulate={simulateGame} />;
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
          simulator={simulator!}
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
