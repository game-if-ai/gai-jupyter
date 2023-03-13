/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
/* eslint-disable */

import React, { useEffect, useRef, useState } from "react";
import { Button, IconButton, Typography } from "@mui/material";
import {
  PlayCircleOutline,
  PauseCircleOutline,
  NavigateBefore,
  NavigateNext,
  VolumeOff,
  VolumeUp,
} from "@mui/icons-material";
import makeStyles from "@mui/styles/makeStyles";

import { Experiment, Simulation } from "../games/simulator";
import { Game } from "../games";
import { useWithPhaserGame } from "../hooks/use-with-phaser-game";
import { useWithWindowSize } from "../hooks/use-with-window-size";

const SPEEDS = [1, 2, 4, 10];

function GamePlayer(props: {
  game: Game;
  experiment: Experiment<Simulation>;
  simulation: number;
  toNotebook: () => void;
  toSummary: () => void;
}): JSX.Element {
  const classes = useStyles();
  const { width, height } = useWithWindowSize();
  const [simulation, setSimulation] = useState<number>(props.simulation);
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const aspect =
    (props.game.config.scale!.width! as number) /
    (props.game.config.scale!.height! as number);
  const gameHeight = Math.min(width / aspect, height - 100);

  const { simulations } = props.experiment;
  const gameContainerRef = useRef<HTMLDivElement | null>(null);
  const {
    eventSystem,
    speed,
    isPaused,
    isMuted,
    loadPhaserGame,
    destroyPhaserGame,
    pause,
    mute,
    changeSpeed,
  } = useWithPhaserGame(gameContainerRef);

  useEffect(() => {
    eventSystem.on("gameOver", endSimulation);
  }, [eventSystem]);

  useEffect(() => {
    loadPhaserGame(props.game, simulations[simulation]);
  }, [simulation]);

  function toNotebook(): void {
    destroyPhaserGame();
    props.toNotebook();
  }

  function toSummary(): void {
    destroyPhaserGame();
    props.toSummary();
  }

  function toSimulation(i: number): void {
    setShowSummary(false);
    setSimulation(i);
  }

  function endSimulation(): void {
    pause(true);
    setShowSummary(true);
  }

  return (
    <div>
      <div className={classes.controls}>
        <Button className={classes.button} onClick={toNotebook}>
          Notebook
        </Button>
        <Button disabled={simulation === 0} onClick={() => toSimulation(0)}>
          1
        </Button>
        <IconButton
          disabled={simulation === 0}
          onClick={() => toSimulation(simulation - 1)}
        >
          <NavigateBefore />
        </IconButton>
        <Typography>{simulation + 1}</Typography>
        <IconButton
          disabled={simulation === simulations.length - 1}
          onClick={() => toSimulation(simulation + 1)}
        >
          <NavigateNext />
        </IconButton>
        <Button
          disabled={simulation === simulations.length - 1}
          onClick={() => toSimulation(simulations.length - 1)}
        >
          {simulations.length}
        </Button>
        <Button className={classes.button} onClick={toSummary}>
          Summary
        </Button>
      </div>
      <div
        className={classes.gameContainer}
        style={{ height: gameHeight, width: width }}
      >
        <div
          id="game-container"
          style={{ width, height: gameHeight }}
          ref={gameContainerRef}
        />
        <div
          className={classes.summary}
          style={{ display: showSummary ? "block" : "none" }}
        >
          <props.game.summaryPanel simulation={simulations[simulation]} />
        </div>
      </div>
      <div className={classes.controls}>
        <IconButton onClick={() => mute(!isMuted)}>
          {isMuted ? <VolumeOff /> : <VolumeUp />}
        </IconButton>
        <IconButton onClick={() => pause(!isPaused)}>
          {isPaused ? <PlayCircleOutline /> : <PauseCircleOutline />}
        </IconButton>
        {SPEEDS.map((s) => (
          <Button
            className={classes.button}
            disabled={speed === s}
            onClick={() => changeSpeed(s)}
          >
            x{s}
          </Button>
        ))}
        <Button
          className={classes.button}
          disabled={showSummary}
          onClick={endSimulation}
        >
          End
        </Button>
      </div>
    </div>
  );
}

const useStyles = makeStyles(() => ({
  gameContainer: {
    position: "relative",
  },
  controls: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignContent: "center",
    alignItems: "center",
    justifyItems: "center",
    justifyContent: "center",
  },
  summary: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    margin: "auto",
    width: "min-content",
    height: "min-content",
    maxWidth: "100%",
    maxHeight: "100%",
  },
  button: {
    textTransform: "none",
  },
}));

export default GamePlayer;
