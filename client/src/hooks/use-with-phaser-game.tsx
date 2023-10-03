/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
/* eslint-disable */

import React, { useEffect, useState } from "react";
import { Game } from "../games";
import { SimulationOutput } from "../store/simulator";
import { useWithSimulator } from "../store/simulator/useWithSimulator";

export function useWithPhaserGame(
  gameContainerRef: React.MutableRefObject<HTMLDivElement | null>
) {
  const [game, setGame] = useState<Game>();
  const [simulation, setSimulation] = useState<SimulationOutput>();
  const [phaserGame, setPhaserGame] = useState<Phaser.Game>();
  const [eventSystem] = useState<Phaser.Events.EventEmitter>(
    new Phaser.Events.EventEmitter()
  );
  const [speed, setSpeed] = useState<number>(1);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const hasGame = Boolean(gameContainerRef.current?.firstChild);
  const simulator = useWithSimulator();

  useEffect(() => {
    if (!game || phaserGame || hasGame) {
      return;
    }
    const config = {
      ...game.config,
      scale: {
        mode: Phaser.Scale.RESIZE,
        height: gameContainerRef?.current?.clientHeight!,
        width: gameContainerRef?.current?.clientWidth!,
      },
      parent: gameContainerRef.current as HTMLElement,
    };
    const pg = new Phaser.Game(config);
    const playManually = simulation === undefined;
    pg.scene.start("Game", {
      playManually,
      isMuted,
      speed,
      eventSystem,
      simulator,
      simulation,
    });
    setPhaserGame(pg);
  }, [phaserGame, game, hasGame]);

  function loadPhaserGame(game: Game, simulation?: SimulationOutput): void {
    if (phaserGame) {
      destroyPhaserGame();
    }
    setSimulation(simulation);
    setGame(game);
  }

  function destroyPhaserGame(): void {
    if (!phaserGame) {
      return;
    }
    eventSystem.removeListener("mute");
    eventSystem.removeListener("pause");
    eventSystem.removeListener("changeSpeed");
    setIsPaused(false);
    setSimulation(undefined);
    setGame(undefined);
    phaserGame.destroy(false);
    gameContainerRef.current?.removeChild(gameContainerRef.current.children[0]);
    setPhaserGame(undefined);
  }

  function mute(muted: boolean): void {
    setIsMuted(muted);
    eventSystem.emit("mute", muted);
  }

  function pause(paused: boolean): void {
    setIsPaused(paused);
    eventSystem.emit("pause", paused);
  }

  function changeSpeed(speed: number): void {
    setSpeed(speed);
    eventSystem.emit("changeSpeed", speed);
  }

  return {
    speed,
    isPaused,
    isMuted,
    hasGame,
    phaserGame,
    eventSystem,
    loadPhaserGame,
    destroyPhaserGame,
    mute,
    pause,
    changeSpeed,
  };
}
