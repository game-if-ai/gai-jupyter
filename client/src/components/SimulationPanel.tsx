/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
/* eslint-disable */

import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import {
  PlayCircleOutline,
  PauseCircleOutline,
  NavigateBefore,
  NavigateNext,
  VolumeOff,
  VolumeUp,
} from "@mui/icons-material";
import makeStyles from "@mui/styles/makeStyles";

import { useWithPhaserGame } from "../hooks/use-with-phaser-game";
import { useWithWindowSize } from "../hooks/use-with-window-size";
import { useWithDialogue } from "../hooks/use-with-dialogue";
import { sessionStorageGet, sessionStorageStore } from "../local-storage";
import { TooltipMsg } from "./Dialogue";
import { GameExperimentTypes } from "../games/activity-types";
import { Game } from "../games";

const SPEEDS = [1, 2, 4, 10];

function GamePlayer(props: {
  game: Game;
  experiment: GameExperimentTypes;
  simulation: number;
  toNotebook: () => void;
  toSummary: () => void;
}): JSX.Element {
  const { simulations } = props.experiment;
  const classes = useStyles();
  const dialogue = useWithDialogue();
  const { width, height } = useWithWindowSize();
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

  const showTutorial = Boolean(sessionStorageGet("show_walkthrough"));
  const sawTutorial = Boolean(sessionStorageGet("saw_notebook_walkthrough"));
  const [simulation, setSimulation] = useState<number>(props.simulation);
  const [showSummary, setShowSummary] = useState<boolean>(false);

  useEffect(() => {
    if (showTutorial && !sawTutorial) {
      dialogue.addMessages([
        {
          id: "current",
          text: "This is the game player. Your classifier results are being used to simulate the choices made by the AI in this game.",
          noSave: true,
        },
        {
          id: "current",
          text: `${simulations.length} game simulations were generated with random spawns, to test your classifier with.`,
          noSave: true,
        },
        {
          id: "speed-2",
          text: "You can speed up the game playback for the simulations.",
          noSave: true,
        },
        {
          id: "end",
          text: "Skip to the end of this simulation to view the summary results for this set of generated spawns.",
          noSave: true,
        },
        {
          id: "next",
          text: "Skip to the next simulation.",
          noSave: true,
        },
        {
          id: "summary",
          text: "Or simply skip all of the simulations to go directly to the classifier summary results.",
          noSave: true,
        },
      ]);
      sessionStorageStore("saw_simulator_walkthrough", "true");
    }
  }, [props.game.id, showTutorial, sawTutorial]);

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
        <Button sx={{ textTransform: "none" }} onClick={toNotebook}>
          Notebook
        </Button>
        <Button
          size="small"
          disabled={simulation === 0}
          onClick={() => toSimulation(0)}
        >
          1
        </Button>
        <IconButton
          disabled={simulation === 0}
          onClick={() => toSimulation(simulation - 1)}
        >
          <NavigateBefore />
        </IconButton>
        <TooltipMsg elemId="current" dialogue={dialogue}>
          <Typography>{simulation + 1}</Typography>
        </TooltipMsg>
        <TooltipMsg elemId="next" dialogue={dialogue}>
          <IconButton
            disabled={simulation === simulations.length - 1}
            onClick={() => toSimulation(simulation + 1)}
          >
            <NavigateNext />
          </IconButton>
        </TooltipMsg>
        <Button
          disabled={simulation === simulations.length - 1}
          onClick={() => toSimulation(simulations.length - 1)}
        >
          {simulations.length}
        </Button>
        <TooltipMsg elemId="summary" dialogue={dialogue}>
          <Button sx={{ textTransform: "none" }} onClick={toSummary}>
            Summary
          </Button>
        </TooltipMsg>
      </div>
      <div
        id="game-container"
        style={{ width, height: height - 100 }}
        ref={gameContainerRef}
      />
      <div
        style={{ position: "absolute", top: 40, bottom: 40, left: 0, right: 0 }}
      />

      <div className={classes.controls}>
        <IconButton size="small" onClick={() => mute(!isMuted)}>
          {isMuted ? <VolumeOff /> : <VolumeUp />}
        </IconButton>
        <IconButton size="small" onClick={() => pause(!isPaused)}>
          {isPaused ? <PlayCircleOutline /> : <PauseCircleOutline />}
        </IconButton>
        {SPEEDS.map((s) => (
          <TooltipMsg key={s} elemId={`speed-${s}`} dialogue={dialogue}>
            <Button
              sx={{ textTransform: "none" }}
              disabled={speed === s}
              onClick={() => changeSpeed(s)}
            >
              x{s}
            </Button>
          </TooltipMsg>
        ))}
        <TooltipMsg elemId="end" dialogue={dialogue}>
          <Button
            sx={{ textTransform: "none" }}
            disabled={showSummary}
            onClick={endSimulation}
          >
            End
          </Button>
        </TooltipMsg>
      </div>
      <Dialog
        className={classes.summary}
        onClose={() => setShowSummary(false)}
        open={showSummary}
      >
        <DialogTitle>Simulation Summary</DialogTitle>
        <DialogContent>
          <props.game.summaryPanel simulation={simulations[simulation]} />
          <Button onClick={() => setShowSummary(false)}>Close</Button>
          <Button
            onClick={() => {
              if (simulation < simulations.length - 1) {
                toSimulation(simulation + 1);
              } else {
                toSummary();
              }
            }}
          >
            {simulation < simulations.length - 1 ? "Next" : "Done"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const useStyles = makeStyles(() => ({
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
    margin: "auto",
    width: "min-content",
    height: "min-content",
    maxWidth: "100%",
    maxHeight: "100%",
    textAlign: "center",
  },
}));

export default GamePlayer;
