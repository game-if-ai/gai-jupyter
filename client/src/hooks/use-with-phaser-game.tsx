/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import React, { useEffect, useState } from "react";
import { Game } from "../games";
import { Simulation } from "../games/simulator";

export function useWithPhaserGame(gameContainerRef: React.MutableRefObject<HTMLDivElement | null>) {
  const [game, setGame] = useState<Game>();
  const [simulation, setSimulation] = useState<Simulation>();
  const [phaserGame, setPhaserGame] = useState<Phaser.Game>();
  const [eventSystem, setEventSystem] = useState<Phaser.Events.EventEmitter>(new Phaser.Events.EventEmitter());
  const hasGame = Boolean(gameContainerRef.current?.firstChild)

  useEffect(() => {
    if (!game || phaserGame || hasGame) {
      return;
    }
    const pg = new Phaser.Game({
      ...game.config,
      parent: gameContainerRef.current as HTMLElement,
    });
    const playManually = simulation === undefined;
    const scene = playManually ? "MainMenu" : "MainGame"
    pg.scene.start(scene, {
      eventSystem,
      playManually,
      simulator: game.simulator,
      simulation
    });
    setPhaserGame(pg);
  }, [phaserGame, game, hasGame]);

  function loadPhaserGame(game: Game, simulation?: Simulation): void {
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
    setSimulation(undefined);
    setGame(undefined);
    phaserGame.destroy(false);
    gameContainerRef.current?.removeChild(gameContainerRef.current.children[0]);
    setPhaserGame(undefined);
  }

  return {
    hasGame,
    phaserGame,
    eventSystem,
    loadPhaserGame,
    destroyPhaserGame,
  }
}
