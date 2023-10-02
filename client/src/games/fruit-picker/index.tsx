/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import Phaser from "phaser";
import FruitGame from "./Game";
import { Summary } from "./components/summary";
import { Game } from "..";
import { useWithFruitPickerCodeExamine } from "./hooks/use-with-fruit-picker-code-examine";
import { ActivityID } from "../../store/simulator";

const GameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.CANVAS,
  title: "Fruit Picker",
  parent: "phaser-container",
  backgroundColor: "#282c34",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 150 },
    },
  },
  scene: [FruitGame],
};

export const FruitPicker: Game = {
  id: ActivityID.fruit,
  title: "Fruit Picker",
  activityType: "GAME",
  gameDescription:
    "PAL the robot is gathering fruit for their picky human overlords, and they need your help! Train PAL's AI by building a classifier to select fruit based on their physical traits.",
  notebookDescription:
    "You are trying to build a classifier to select fruit based on their physical traits.",
  config: GameConfig,
  improveCodeHints: [],
  summaryPanel: Summary,
  codeExamine: useWithFruitPickerCodeExamine,
};

export default FruitPicker;
