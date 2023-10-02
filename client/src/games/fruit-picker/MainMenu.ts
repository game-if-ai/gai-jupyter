/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { GameParams } from "games";
import Phaser from "phaser";
import {
  addBackground,
  addImage,
  addText,
  Anchor,
  scaleImage,
  scaleText,
} from "../phaser-helpers";

export default class MainMenu extends Phaser.Scene {
  images: Phaser.GameObjects.Image[];
  text: Phaser.GameObjects.Text[];

  constructor() {
    super("MainMenu");
    this.images = [];
    this.text = [];
  }

  preload() {
    this.load.setPath("assets/fruit-picker");
    this.load.image("background", "background.jpg");
    this.load.image("logo", "logo.png");
    this.load.image("logo2", "logo2.png");
    this.load.setPath("assets/sounds");
    this.load.audio("match", ["match.ogg", "match.mp3"]);
  }

  create(data: GameParams) {
    window.addEventListener("resize", () => {
      this.resize();
    });
    const bg = addBackground(this, "background");
    const logo = addImage(this, "logo", undefined, { bg, y: -200 });
    const logo2 = addImage(this, "logo2", undefined, { bg, y: -200 }).setAlpha(
      0
    );
    this.images.push(bg);
    this.images.push(logo);
    this.images.push(logo2);
    this.text.push(
      addText(this, "Catch the fruits!", {
        bg,
        widthRel: 0.9,
        maxFontSize: 78,
      })
    );
    this.text.push(
      addText(this, "Background Image by brgfx on Freepik", {
        bg,
        yAnchor: Anchor.end,
      })
    );
    this.tweens.add({
      targets: bg,
      alpha: { from: 0, to: 1 },
      duration: 1000,
    });
    this.tweens.add({
      targets: [logo, logo2],
      y: bg.displayHeight * 0.7,
      ease: "bounce.out",
      duration: 1200,
    });
    this.input.once("pointerdown", () => {
      this.sound.play("match");
      this.tweens.add({
        targets: logo2,
        alpha: { from: 0, to: 1 },
        duration: 250,
        onComplete: () => {
          this.tweens.add({
            targets: logo2,
            alpha: { from: 1, to: 0 },
            duration: 250,
            onComplete: () => {
              this.scene.start("MainGame", data);
            },
          });
        },
      });
    });
  }

  resize() {
    if (!this?.cameras?.main) return;
    for (const image of this.images) {
      scaleImage(this, image);
    }
    for (const text of this.text) {
      scaleText(this, text);
    }
  }
}
