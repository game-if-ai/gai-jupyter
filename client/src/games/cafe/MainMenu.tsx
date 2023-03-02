/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import Phaser from "phaser";
import { GameParams } from "..";
import { CafeSimulation } from "./simulator";

const fontStyle = {
  fontFamily: "Arial",
  fontSize: "48",
  color: "#ffffff",
  fontStyle: "bold",
  shadow: {
    color: "#000000",
    fill: true,
    offsetX: 2,
    offsetY: 2,
    blur: 4,
  },
};

const labelFont = {
  // font: "bold 15px Arial",
  color: "#ffffff",
  wordWrap: { width: 480 },
  shadow: {
    color: "#000000",
    fill: true,
    offsetX: 2,
    offsetY: 2,
    blur: 4,
  },
};

export default class MainMenu extends Phaser.Scene {
  constructor() {
    super("MainMenu");
  }

  preload() {
    this.load.setPath("assets/cafe/sprites");
    this.load.atlas("bg_kitchen", "bg_kitchen.png", "bg_kitchen.json");
    this.load.atlas("char_bears", "char_bears.png", "char_bears.json");
    this.load.atlas("char_speech", "char_speech.png", "char_speech.json");
    this.load.atlas("food", "food.png", "food.json");
  }

  create(data: GameParams<CafeSimulation>) {
    this.add.image(320, 180, "bg_kitchen", "top").setScale(2);
    this.add.image(250, 40, "bg_kitchen", "hanging_plant").setScale(2).flipX =
      true;
    this.add.image(390, 40, "bg_kitchen", "hanging_plant").setScale(2);
    this.add.image(150, 22, "bg_kitchen", "hanging_light").setScale(2);
    this.add.image(490, 22, "bg_kitchen", "hanging_light").setScale(2);
    this.add.image(200, 125, "bg_kitchen", "plant1").setScale(2);
    this.add.image(320, 125, "bg_kitchen", "plant1").setScale(2);
    this.add.image(440, 125, "bg_kitchen", "plant1").setScale(2);
    this.add.image(120, 115, "bg_kitchen", "plant2").setScale(2);
    this.add.image(520, 115, "bg_kitchen", "plant2").setScale(2);
    this.add.image(35, 90, "bg_kitchen", "painting1").setScale(2);
    this.add.image(605, 90, "bg_kitchen", "painting2").setScale(2);
    this.add.image(35, 37, "bg_kitchen", "clock").setScale(2);

    const bear = this.add.image(320, 145, "char_bears", "brown").setScale(2);
    const bubble = this.add.image(320, 110, "char_speech", "...").setScale(2);
    this.time.addEvent({
      delay: 200,
      loop: true,
      callback: () => {
        if (bear.frame.name.endsWith("2")) {
          bear.setTexture("char_bears", "brown");
        } else {
          bear.setTexture("char_bears", "brown2");
        }
      },
      callbackScope: this,
    });
    this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        bear.flipX = !bear.flipX;
        if (bear.frame.name.endsWith("2")) {
          bubble.y = 108;
        } else {
          bubble.y = 110;
        }
      },
      callbackScope: this,
    });

    this.add.image(320, 260, "bg_kitchen", "bottom").setScale(2);
    this.add.image(485, 330, "bg_kitchen", "divider").setScale(2);
    this.add.image(568, 330, "bg_kitchen", "shelf").setScale(2);
    this.add.image(570, 345, "bg_kitchen", "trash").setScale(2);

    this.add.text(5, 5, "Time: 120:00", fontStyle);
    this.add.text(565, 5, "Score: 0", fontStyle);
    this.add.text(565, 20, "Accuracy: 100%", fontStyle);
    this.add.text(5, 290, "", labelFont);

    this.input.once("pointerdown", () => {
      this.scene.start("MainGame", data);
    });
  }
}
