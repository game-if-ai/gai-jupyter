/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import Phaser from "phaser";
import { addImage, addSprite, addText, scaleImage } from "../phaser-helpers";
import { CafeGameParams } from "./MainGame";

export default class MainMenu extends Phaser.Scene {
  text?: Phaser.GameObjects.Text;
  timerText?: Phaser.GameObjects.Text;
  accuracyText?: Phaser.GameObjects.Text;
  images: Phaser.GameObjects.Image[];

  constructor() {
    super("MainMenu");
    this.images = [];
  }

  preload() {
    this.load.setPath("assets/cafe");
    this.load.image("background", "background.png");
    this.load.setPath("assets/cafe/sprites");
    this.load.atlas("bg_kitchen", "bg_kitchen.png", "bg_kitchen.json");
    this.load.atlas("char_bears", "char_bears.png", "char_bears.json");
    this.load.atlas("char_speech", "char_speech.png", "char_speech.json");
    this.load.atlas("food", "food.png", "food.json");
  }

  create(data: CafeGameParams) {
    this.cameras.main.setBackgroundColor("#4f4135");
    const bgTop = addImage(this, "background", undefined, { widthScale: 1 });
    this.images.push(bgTop);
    const bear = addImage(this, "char_bears", "brown", {
      height: bgTop.displayHeight / 3,
    });
    this.images.push(bear);
    bear.setY(bear.y - (bgTop.displayHeight / 8 + 5));
    const bubble = addImage(this, "char_speech", "...", {
      height: bgTop.displayHeight / 4,
    });
    this.images.push(bubble);
    bubble.setX(bubble.x - bear.displayWidth / 2);
    bubble.setY(bubble.y - bear.displayHeight);
    const bgBot = addImage(this, "bg_kitchen", "bottom", {
      width: bgTop.displayWidth,
      y: bgTop.displayHeight / 2,
    });
    this.images.push(bgBot);
    const trash = addImage(this, "bg_kitchen", "trash", {
      height: bgBot.displayHeight / 2,
      x: bgTop.displayWidth / 2,
      y: bgTop.displayHeight / 2,
    });
    this.images.push(trash);
    this.timerText = addText(this, `Time: 120:00`, {
      x: 5,
      width: 0.5,
      maxFontSize: 32,
    });
    this.accuracyText = addText(this, "Accuracy: 0", {
      x: -5,
      xRel: 1,
      width: 0.5,
      maxFontSize: 32,
    });
    const yTextOffset =
      (this.cameras.main.displayHeight - bgTop.displayHeight) / 2 +
      bgTop.displayHeight / 2 +
      bgBot.displayHeight / 2;
    const textX = (this.cameras.main.displayWidth - bgTop.displayWidth) / 2;
    const maxTextWidth = trash.x - trash.displayWidth / 2 - textX;
    addText(
      this,
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      { x: textX, y: yTextOffset, yRel: 0, maxWidth: maxTextWidth }
    );
    this.images.push(
      addSprite(this, "food", "riceball", { height: bgBot.displayHeight / 1.5 })
    );

    let a2 = 1;
    this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        bubble.y = bubble.y + 2 * a2;
        a2 *= -1;
      },
      callbackScope: this,
    });

    this.input.once("pointerdown", () => {
      this.scene.start("MainGame", data);
    });
  }

  resize() {
    if (!this?.cameras?.main) return;
    for (const image of this.images) {
      scaleImage(this, image);
    }
  }
}
