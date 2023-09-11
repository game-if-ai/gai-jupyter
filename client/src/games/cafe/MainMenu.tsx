/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import Phaser from "phaser";
import {
  addBackground,
  addImage,
  addSprite,
  addText,
  Anchor,
  scaleImage,
} from "../phaser-helpers";
import { randomInt } from "../../utils";
import { CafeGameParams } from "./MainGame";
import { SPAWN_TIME } from "./simulator";

export default class MainMenu extends Phaser.Scene {
  bg?: Phaser.GameObjects.Image;
  screen?: Phaser.GameObjects.Image;
  screenText?: Phaser.GameObjects.Text;
  pal?: Phaser.GameObjects.Sprite;
  trash: Phaser.GameObjects.Sprite[];
  trashText: Phaser.GameObjects.Text[];
  scoreText?: Phaser.GameObjects.Text;

  constructor() {
    super("MainMenu");
    this.trash = [];
    this.trashText = [];
  }

  preload() {
    this.load.setPath("assets");
    this.load.spritesheet("pal", "pal_spritesheet.png", {
      frameWidth: 250,
      frameHeight: 250,
    });
    this.load.image(
      "window",
      "wordui/inner_panels/blue/premade_panels/blue_long_horizontal.png"
    );
    this.load.image(
      "button",
      "wordui/buttons/long_buttons/blue_button_complete.png"
    );
    this.load.setPath("assets/cafe");
    for (let i = 1; i <= 2; i++) {
      this.load.image(`background${i}`, `background${i}.jpg`);
    }
    for (let i = 1; i <= 4; i++) {
      this.load.image(`bin${i}`, `bin${i}.png`);
    }
    for (let i = 1; i <= 4; i++) {
      this.load.image(`zap${i}`, `zap${i}.png`);
    }
    for (let i = 1; i <= 10; i++) {
      this.load.image(`box${i}`, `box${i}.png`);
    }
    this.load.setPath("assets/cafe/sounds");
    this.load.audio("match", ["match.ogg", "match.mp3"]);
    this.load.audio("wrong", ["wrong.mp3"]);
  }

  create(data: CafeGameParams) {
    // add background
    this.cameras.main.setBackgroundColor("#2d3052");
    this.bg = addBackground(this, "background1");
    this.tweens.add({
      targets: this.bg,
      alpha: { from: 0.5, to: 1 },
      duration: 500,
    });
    const isMobile =
      this.cameras.main.displayHeight / 2 >= this.bg.displayHeight;
    if (isMobile) {
      const bgTop = addImage(this, "background2", undefined, {
        bg: this.bg,
        yAnchor: Anchor.start,
        width: this.bg.displayWidth,
      });
      bgTop.setY(bgTop.y - bgTop.displayHeight);
    }
    // add screen
    this.screen = addImage(
      this,
      "window",
      undefined,
      isMobile
        ? {
            bg: this.bg,
            yAnchor: Anchor.end,
            height:
              (this.cameras.main.displayHeight - this.bg.displayHeight) / 2,
          }
        : {
            bg: this.bg,
            xAnchor: Anchor.end,
            yAnchor: Anchor.start,
            heightRel: 0.5,
            xRel: -0.01,
            yRel: 0.01,
          }
    );
    if (isMobile) {
      if (this.screen.displayWidth > this.bg.displayWidth) {
        scaleImage(this, this.screen, {
          bg: this.bg,
          yAnchor: Anchor.end,
          width: this.bg.displayWidth,
        });
      }
      this.screen.setY(this.screen.displayHeight / 2);
    }
    this.screenText = addText(this, "Bought or Not?", {
      bg: this.screen,
      widthRel: 0.9,
      maxHeight: this.screen.displayHeight * 0.9,
    });
    // add pal
    this.anims.create({
      key: "good",
      frames: this.anims.generateFrameNumbers("pal", {
        frames: [...Array(12).keys()].map((v) => v + 12 + 7),
      }),
      frameRate: 20,
      repeat: 0,
    });
    this.anims.create({
      key: "bad",
      frames: this.anims.generateFrameNumbers("pal", {
        frames: [...Array(18).keys()].map(
          (v) => v + 12 + 7 + 12 + 24 + 24 + 14
        ),
      }),
      frameRate: 20,
      repeat: 0,
    });
    this.pal = addSprite(
      this,
      "pal",
      undefined,
      isMobile
        ? {
            bg: this.bg,
            yAnchor: Anchor.start,
            xAnchor: Anchor.center,
            height: this.bg.displayHeight,
          }
        : {
            bg: this.bg,
            heightRel: 0.5,
            yAnchor: Anchor.start,
          }
    );
    if (!isMobile) {
      this.pal.setX(this.bg.x - this.pal.displayWidth);
    }
    // add trash bins
    const matrix = ["TP", "FP", "TN", "FN"];
    let binX = this.bg.displayWidth * (isMobile ? 0.1 : 0.15);
    for (let i = 0; i < 4; i++) {
      const trash = addSprite(this, `bin${i + 1}`, undefined, {
        bg: this.bg,
        xAnchor: Anchor.start,
        yAnchor: Anchor.end,
        widthRel: isMobile ? 0.2 : 0.1,
        x: binX,
        y: isMobile ? this.screen.displayHeight : this.bg.displayHeight * -0.15,
      });
      binX += trash.displayWidth + 5;
      addText(this, matrix[i], {
        bg: trash,
        yAnchor: Anchor.center,
        widthRel: 0.3,
        maxFontSize: 32,
      });
      const trashText = addText(this, "0", {
        bg: trash,
        yAnchor: Anchor.start,
        y: -5,
        widthRel: 1,
        maxFontSize: 32,
      });
      this.trash.push(trash);
      this.trashText.push(trashText);
    }
    // add text
    this.scoreText = addText(this, `Time: 120:00 | Accuracy: 100%`, {
      bg: this.screen,
      xAnchor: Anchor.center,
      yAnchor: Anchor.start,
      heightRel: 0.05,
      maxFontSize: 32,
    });
    // add buttons
    const startButton = addImage(this, "button", undefined, {
      bg: isMobile ? this.bg : this.screen,
      yAnchor: Anchor.end,
      widthRel: 0.3,
    });
    startButton.setY(startButton.y + startButton.displayHeight);
    addText(this, "Start!", {
      bg: startButton,
      heightRel: 0.5,
    });
    // add events
    startButton.setInteractive();
    startButton.on(
      "pointerdown",
      () => {
        this.sound.play("match");
        this.scene.start("MainGame", data);
      },
      this
    );
    this.time.addEvent({
      delay: SPAWN_TIME,
      startAt: SPAWN_TIME,
      loop: true,
      callback: this.spawn,
      callbackScope: this,
    });
  }

  spawn() {
    if (!this.bg || !this.pal || this.trash.length === 0) return;
    const box = addSprite(this, `box${randomInt(10) + 1}`, undefined, {
      bg: this.bg,
      heightRel: 0.2,
      y: this.bg.displayHeight * -0.05,
      xAnchor: Anchor.start,
      yAnchor: Anchor.end,
    });
    const pal = this.pal;
    const t = randomInt(4);
    this.tweens.add({
      targets: box,
      x: this.bg.displayWidth * 0.95,
      duration: SPAWN_TIME,
      onComplete: () => {
        const zap = addSprite(this, "zap1", undefined, {
          bg: box,
          heightRel: 1,
        });
        zap.setY(zap.y - zap.displayHeight * 0.5);
        let zapFrame = 1;
        this.time.addEvent({
          delay: 100,
          repeat: 4,
          callback: () => {
            if (zapFrame > 4) {
              zap.destroy();
            } else {
              zap.setTexture(`${zap.texture.key.slice(0, -1)}${zapFrame}`);
              zapFrame++;
            }
          },
          callbackScope: this,
        });
        this.tweens.add({
          targets: box,
          x: this.trash[t].x,
          y: this.trash[t].y,
          delay: 50,
          duration: 300,
          ease: "sine.inout",
          onComplete: () => {
            this.tweens.add({
              targets: this.trash[t],
              scale: 1.4,
              angle: "-=30",
              yoyo: true,
              ease: "sine.inout",
              duration: 100,
              onComplete: () => {
                box.destroy();
              },
            });
          },
        });
        if (t === 0 || t === 2) {
          pal.play("good");
          this.sound.play("match");
        } else {
          pal.play("bad");
          this.sound.play("wrong");
        }
      },
    });
  }
}
