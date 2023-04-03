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
import { Activities, Activity, isGameActivity } from "../games";
import { useWithPhaserGame } from "../hooks/use-with-phaser-game";
import { useWithWindowSize } from "../hooks/use-with-window-size";

function ActivityPicker(props: {
  loadActivity: (g: Activity) => void;
}): JSX.Element {
  const [activity, setActivity] = useState<Activity>();
  const { width, height } = useWithWindowSize();
  const gameContainerRef = useRef<HTMLDivElement | null>(null);
  const { loadPhaserGame, destroyPhaserGame } =
    useWithPhaserGame(gameContainerRef);

  function selectGame(id: string): void {
    const activity = Activities.find((g) => g.id === id);
    if (!activity) {
      return;
    }
    setActivity(activity);
    if (isGameActivity(activity)) {
      loadPhaserGame(activity);
    }
  }

  function confirm(): void {
    if (!activity) {
      return;
    }
    destroyPhaserGame();
    props.loadActivity(activity);
  }

  return (
    <div>
      <div style={{ paddingTop: 20, paddingLeft: 20, paddingRight: 20 }}>
        <FormControl fullWidth>
          <InputLabel>Select Game</InputLabel>
          <Select
            value={activity?.id || ""}
            label="Select Game"
            onChange={(e) => selectGame(e.target.value)}
          >
            {Activities.map((g) => (
              <MenuItem key={g.id} value={g.id}>
                {g.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button disabled={!activity} onClick={confirm}>
          Confirm
        </Button>
      </div>
      <div
        id="game-container"
        style={{ width, height: height - 125 }}
        ref={gameContainerRef}
      />
    </div>
  );
}

export default ActivityPicker;
