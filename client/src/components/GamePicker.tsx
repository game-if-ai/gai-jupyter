/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import React, { useRef, useState } from "react";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { Game, Games } from "../games";
import { useWithPhaserGame } from "../hooks/use-with-phaser-game";

function GamePicker(props: { loadGame: (g: Game) => void }): JSX.Element {
  const [game, setGame] = useState<Game>();
  const gameContainerRef = useRef<HTMLDivElement | null>(null);
  const { loadPhaserGame, destroyPhaserGame } =
    useWithPhaserGame(gameContainerRef);

  function selectGame(id: string): void {
    const game = Games.find((g) => g.id === id);
    if (!game) {
      return;
    }
    setGame(game);
    loadPhaserGame(game);
  }

  function confirm(): void {
    if (!game) {
      return;
    }
    destroyPhaserGame();
    props.loadGame(game);
  }

  return (
    <div>
      <FormControl fullWidth>
        <InputLabel>Select Game</InputLabel>
        <Select
          value={game?.id}
          label="Select Game"
          onChange={(e) => selectGame(e.target.value)}
        >
          {Games.map((g) => (
            <MenuItem key={g.id} value={g.id}>
              {g.config.title}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button disabled={!game} onClick={confirm}>
        Confirm
      </Button>
      <div id="game-container" ref={gameContainerRef} />
    </div>
  );
}

export default GamePicker;
