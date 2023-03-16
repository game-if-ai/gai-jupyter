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
  fontSize: "16px",
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
  fontFamily: "Arial",
  fontStyle: "bold",
  fontSize: "18px",
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
    this.cameras.main.setBackgroundColor("#4f4135");
    const offset =
      this.game.canvas.height > 180 ? (this.game.canvas.height / 2) % 180 : 0;
    this.add.image(160, 90 + offset, "bg_kitchen", "top");
    this.add.image(120, 20 + offset, "bg_kitchen", "hanging_plant").flipX =
      true;
    this.add.image(200, 20 + offset, "bg_kitchen", "hanging_plant");
    this.add.image(75, 10 + offset, "bg_kitchen", "hanging_light");
    this.add.image(245, 10 + offset, "bg_kitchen", "hanging_light");
    this.add.image(100, 62 + offset, "bg_kitchen", "plant1");
    this.add.image(160, 62 + offset, "bg_kitchen", "plant1");
    this.add.image(220, 62 + offset, "bg_kitchen", "plant1");
    this.add.image(60, 57 + offset, "bg_kitchen", "plant2");
    this.add.image(260, 57 + offset, "bg_kitchen", "plant2");
    this.add.image(17, 45 + offset, "bg_kitchen", "painting1");
    this.add.image(302, 45 + offset, "bg_kitchen", "painting2");
    this.add.image(17, 18 + offset, "bg_kitchen", "clock");

    const bear = this.add
      .image(160, 72 + offset, "char_bears", "brown")
      .setScale(2);
    const bubble = this.add
      .image(160, 35 + offset, "char_speech", "...")
      .setScale(2.5);
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
          bubble.y = 34 + offset;
        } else {
          bubble.y = 35 + offset;
        }
      },
      callbackScope: this,
    });

    this.add.image(160, 130 + offset, "bg_kitchen", "bottom");
    this.add.image(242.5, 165 + offset, "bg_kitchen", "divider");
    this.add.image(285, 172 + offset, "bg_kitchen", "trash");

    this.add.text(5, 5, "Time: 120:00", fontStyle);
    this.add.text(-5, 5, "Score: 0", {
      ...fontStyle,
      fixedWidth: Number(this.game.config.width),
      align: "right",
    });
    this.add.text(-5, 25, "Accuracy: 100%", {
      ...fontStyle,
      fixedWidth: Number(this.game.config.width),
      align: "right",
    });
    this.add.text(5, 145 + offset, "", labelFont);

    this.input.once("pointerdown", () => {
      this.scene.start("MainGame", data);
    });
  }
}
