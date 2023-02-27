/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import Phaser from "phaser";
import { GameParams } from ".";

export default class MainMenu extends Phaser.Scene {
  constructor() {
    super("MainMenu");
  }

  preload() {
    this.load.setPath("assets/fruit-picker");
    this.load.image("background", "background.png");
    this.load.image("logo", "logo.png");
    this.load.image("logo2", "logo2.png");
    this.load.setPath("assets/fruit-picker/sounds");
    this.load.audio("match", ["match.ogg", "match.mp3"]);
  }

  create(data: GameParams) {
    let background = this.add.image(400, 300, "background");
    this.tweens.add({
      targets: background,
      alpha: { from: 0, to: 1 },
      duration: 1000,
    });
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
    this.add.text(
      20,
      20,
      "High Score: " + data.simulator.summary.highScore,
      fontStyle
    );
    let logo = this.add.image(400, -200, "logo");
    this.tweens.add({
      targets: logo,
      y: 300,
      ease: "bounce.out",
      duration: 1200,
    });
    this.input.once("pointerdown", () => {
      this.sound.play("match");
      let logo2 = this.add.image(400, 300, "logo2");
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
}
