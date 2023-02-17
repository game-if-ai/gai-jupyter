/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Paper,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";

import FruitPicker from "./fruit-picker";
import FruitClassifier from "./fruit-picker/classifier";
import { Classifier, ClassifierInput, ClassifierOutput } from "./classifier";
import { SimulationOutput, SimulationSummary, Simulator } from "./simulator";
import {
  FruitSimulationOutput,
  FruitSimulator,
} from "./fruit-picker/simulator";

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
  row: {
    display: "flex",
    flexFlow: "row",
    width: "100%",
    alignContent: "center",
    alignItems: "center",
    justifyItems: "center",
    justifyContent: "center",
  },
}));

function App(): JSX.Element {
  const classes = useStyles();
  const [game, setGame] = useState<Phaser.Types.Core.GameConfig>();
  const [classifier, setClassifier] =
    useState<Classifier<ClassifierInput, ClassifierOutput>>();
  const [simulator, setSimulator] =
    useState<
      Simulator<SimulationOutput, Classifier<ClassifierInput, ClassifierOutput>>
    >();
  const [phaserGame, setPhaserGame] = useState<Phaser.Game>();
  const [numSimulations, setNumSimulations] = useState<number>(10);
  const [simulations, setSimulations] = useState<SimulationOutput[]>([]);
  const [summary, setSummary] = useState<SimulationSummary>();
  const gameContainerElement = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const game = FruitPicker;
    const classifier = new FruitClassifier();
    const simulator = new FruitSimulator(classifier);
    loadGame(game, classifier, simulator);
  }, []);

  function loadGame(
    config: Phaser.Types.Core.GameConfig,
    classifier: Classifier<ClassifierInput, ClassifierOutput>,
    simulator: Simulator<
      SimulationOutput,
      Classifier<ClassifierInput, ClassifierOutput>
    >
  ): void {
    const c = {
      ...config,
      parent: gameContainerElement.current as HTMLElement,
    };
    setGame(c);
    setClassifier(classifier);
    setSimulator(simulator);
  }

  function simulate(): void {
    if (!simulator) {
      return;
    }
    simulator.simulate(numSimulations);
    setSimulations([...simulator.simulations]);
    setSummary({ ...simulator.summary });
  }

  function startGame(simulation?: SimulationOutput): void {
    if (!game || !classifier || !simulator) {
      return;
    }
    const phaserGame = new Phaser.Game(game);
    phaserGame.scene.start("Boot", {
      simulator,
      simulation,
    });
    setPhaserGame(phaserGame);
  }

  function closeGame(): void {
    if (!phaserGame) {
      return;
    }
    phaserGame.destroy(true, false);
    setPhaserGame(undefined);
  }

  return (
    <div className={classes.root}>
      <TextField
        variant="outlined"
        label="Number of Simulations"
        value={numSimulations}
        onChange={(e) => setNumSimulations(Number(e.target.value) || 0)}
        inputProps={{ inputMode: "numeric", pattern: "[0-9]+" }}
        InputLabelProps={{ shrink: true }}
      />
      <div className={classes.row}>
        <Button disabled={!simulator} onClick={() => simulate()}>
          Run {numSimulations} Simulation(s)
        </Button>
        {phaserGame ? (
          <Button onClick={closeGame}>Quit</Button>
        ) : (
          <Button onClick={() => startGame()}>Play Game Manually</Button>
        )}
      </div>
      <div className={classes.row}>
        <div style={{ width: "50%" }}>
          {summary ? (
            <div>
              <Typography>Number of runs: {summary.numRuns}</Typography>
              <Typography>
                Scores: high={summary.highScore} low={summary.lowScore} average=
                {summary.averageScore}
              </Typography>
              <Typography>
                Accuracy: high={summary.highAccuracy} low=
                {summary.lowAccuracy} average={summary.averageAccuracy}
              </Typography>
            </div>
          ) : undefined}
          <TableContainer component={Paper} style={{ width: "100%" }}>
            <TableHead>
              <TableRow>
                <TableCell>Run #</TableCell>
                <TableCell align="right">Score</TableCell>
                <TableCell align="right">Accuracy</TableCell>
                {game?.title === "Fruit Picker" ? (
                  <TableCell align="right">Label</TableCell>
                ) : undefined}
                {game?.title === "Fruit Picker" ? (
                  <TableCell align="right">Match Label</TableCell>
                ) : undefined}
                <TableCell align="right">View Simulation</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {simulations.map((s, i) => (
                <TableRow
                  key={i + 1}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {i}
                  </TableCell>
                  <TableCell align="right">{s.score}</TableCell>
                  <TableCell align="right">{`${s.accuracy * 100}%`}</TableCell>
                  {game?.title === "Fruit Picker" ? (
                    <TableCell align="center">
                      {(s as FruitSimulationOutput).label}
                    </TableCell>
                  ) : undefined}
                  {game?.title === "Fruit Picker" ? (
                    <TableCell align="center">
                      {(s as FruitSimulationOutput).matchLabel}
                    </TableCell>
                  ) : undefined}
                  <TableCell align="right">
                    <Button onClick={() => startGame(s)}>Run</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </TableContainer>
        </div>
        <div style={{ width: "50%" }}>
          <div id="game-container" ref={gameContainerElement} />
        </div>
      </div>
    </div>
  );
}

export default App;
