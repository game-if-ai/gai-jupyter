/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import Phaser from "phaser";
import MainMenu from "./MainMenu";
import MainGame from "./MainGame";
import { FruitSimulation, FruitSimulator } from "./simulator";
import { Game } from "..";
import { Summary } from "./Summary";

const GameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  title: "Fruit Picker",
  parent: "phaser-container",
  width: 800,
  height: 600,
  backgroundColor: "#282c34",
  scale: {
    mode: Phaser.Scale.ScaleModes.RESIZE,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 150 },
    },
  },
  scene: [MainMenu, MainGame],
};

export interface GameParams {
  playManually: boolean;
  simulator: FruitSimulator;
  simulation?: FruitSimulation;
}

export const FruitPicker: Game = {
  id: "fruitpicker",
  config: GameConfig,
  simulator: new FruitSimulator(),
  summaryPanel: Summary,
};

export default FruitPicker;
