/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import React, { useEffect, useRef, useState } from "react";
import { Button, IconButton, Typography } from "@mui/material";
import {
  PlayCircleOutline,
  PauseCircleOutline,
  NavigateBefore,
  NavigateNext,
  VolumeOff,
  VolumeUp,
  FastForward,
} from "@mui/icons-material";
import makeStyles from "@mui/styles/makeStyles";

import { Simulation } from "../simulator";
import { EventSystem } from "../event-system";
import { Game } from "../games";

const SPEEDS = [1, 2, 4, 10];

function GamePlayer(props: {
  game: Game;
  simulations: Simulation[];
  simulation: number;
  toNotebook: () => void;
  toSummary: () => void;
}): JSX.Element {
  const classes = useStyles();
  const [game, setGame] = useState<Phaser.Game>();
  const [simulation, setSimulation] = useState<number>(props.simulation);
  const [speed, setSpeed] = useState<number>(1);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showSummary, setShowSummary] = useState<boolean>(false);

  const { simulations } = props;
  const gameContainerElement = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let g: Phaser.Game | undefined = game;
    if (!g) {
      g = new Phaser.Game({
        ...props.game.config,
        parent: gameContainerElement.current as HTMLElement,
      });
      EventSystem.on("gameOver", endSimulation);
      setGame(g);
    }
    g.scene.start("MainGame", {
      playManually: false,
      simulator: props.game.simulator,
      simulation: simulations[simulation],
    });
  }, [game, simulation]);

  function toNotebook(): void {
    if (game) {
      game.destroy(true);
      setGame(undefined);
    }
    props.toNotebook();
  }

  function toSummary(): void {
    if (game) {
      game.destroy(true);
      setGame(undefined);
    }
    props.toSummary();
  }

  function toSimulation(i: number): void {
    pause(false);
    setShowSummary(false);
    setSimulation(i);
  }

  function endSimulation(): void {
    pause(true);
    setShowSummary(true);
  }

  function mute(muted: boolean): void {
    setIsMuted(muted);
    EventSystem.emit("mute", muted);
  }

  function pause(paused: boolean): void {
    setIsPaused(paused);
    EventSystem.emit("pause", paused);
  }

  function changeSpeed(speed: number): void {
    setSpeed(speed);
    EventSystem.emit("changeSpeed", speed);
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
        <Typography>...</Typography>
        <Button
          disabled={simulation === 0}
          onClick={() => toSimulation(simulation - 1)}
        >
          <NavigateBefore />
        </Button>
        <Typography>{simulation + 1}</Typography>
        <Button
          disabled={simulation === simulations.length - 1}
          onClick={() => toSimulation(simulation + 1)}
        >
          <NavigateNext />
        </Button>
        <Typography>...</Typography>
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
        style={{
          height: props.game.config.height,
          width: props.game.config.width,
        }}
      >
        <div id="game-container" ref={gameContainerElement} />
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
        <div style={{ width: 50 }} />
        <FastForward color="disabled" />
        {SPEEDS.map((s) => (
          <Button
            className={classes.button}
            disabled={speed === s}
            onClick={() => changeSpeed(s)}
          >
            x{s}
          </Button>
        ))}
        <div style={{ width: 50 }} />
        <Button
          className={classes.button}
          disabled={showSummary}
          onClick={endSimulation}
        >
          End Run
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
    display: "flex",
    flexFlow: "row",
    width: "100%",
    alignContent: "center",
    alignItems: "center",
    justifyItems: "center",
    justifyContent: "center",
  },
  summary: {
    position: "absolute",
    top: 250,
    left: 250,
  },
  button: {
    textTransform: "none",
  },
}));

export default GamePlayer;