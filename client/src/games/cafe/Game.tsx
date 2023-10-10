/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import Phaser from "phaser";
import { SPAWN_TIME, GAME_TIME, CafeSimulationOutput } from "./simulator";
import { GameParams } from "..";
import {
  addBackground,
  addImage,
  addSprite,
  addText,
  Anchor,
  scaleImage,
  scaleText,
} from "../phaser-helpers";
import { randomInt } from "../../utils";

export default class Game extends Phaser.Scene {
  speed: number;
  isPaused: boolean;
  isMuted: boolean;
  config?: GameParams;
  eventSystem?: Phaser.Events.EventEmitter;
  timerEvent?: Phaser.Time.TimerEvent;
  spawnEvent?: Phaser.Time.TimerEvent;

  truePositive: number;
  trueNegative: number;
  falsePositive: number;
  falseNegative: number;

  bg?: Phaser.GameObjects.Image;
  screen?: Phaser.GameObjects.Image;
  screenText?: Phaser.GameObjects.Text;
  pal?: Phaser.GameObjects.Sprite;
  trash: Phaser.GameObjects.Sprite[];
  trashText: Phaser.GameObjects.Text[];
  scoreText?: Phaser.GameObjects.Text;
  items: Phaser.GameObjects.Sprite[];
  itemIdx: number;

  yesButton?: Phaser.GameObjects.Image;
  noButton?: Phaser.GameObjects.Image;
  yesText?: Phaser.GameObjects.Text;
  noText?: Phaser.GameObjects.Text;

  constructor() {
    super("Game");
    this.speed = 1;
    this.isPaused = false;
    this.isMuted = false;
    this.truePositive = 0;
    this.trueNegative = 0;
    this.falsePositive = 0;
    this.falseNegative = 0;
    this.items = [];
    this.itemIdx = 0;
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
    this.load.image(
      "buttonYes",
      "wordui/buttons/long_buttons/green_button_complete.png"
    );
    this.load.image(
      "buttonNo",
      "wordui/buttons/long_buttons/red_button_complete.png"
    );
    this.load.setPath("assets/cafe");
    for (let i = 1; i <= 2; i++) {
      this.load.image(`background${i}`, `background${i}.jpg`);
    }
    for (let i = 1; i <= 4; i++) {
      this.load.image(`bin${i}`, `bin${i}.png`);
    }
    for (let i = 1; i <= 10; i++) {
      this.load.image(`box${i}`, `box${i}.png`);
    }
    this.load.setPath("assets/sounds");
    this.load.audio("match", ["match.ogg", "match.mp3"]);
    this.load.audio("wrong", ["wrong.mp3"]);
  }

  create(data: GameParams) {
    this.config = data;
    this.eventSystem = data.eventSystem;
    this.eventSystem.on("pause", this.pause, this);
    this.eventSystem.on("mute", this.mute, this);
    this.eventSystem.on("changeSpeed", this.changeSpeed, this);
    this.mute(data.isMuted);
    this.changeSpeed(data.speed);
    this.createScene();
    if (!this.config.playManually) {
      this.start();
    }
  }

  createScene(): void {
    // add background
    const camera = this.cameras.main;
    camera.setBackgroundColor("#2d3052");
    this.bg = addBackground(this, "background1");
    const isMobile = camera.displayHeight / 2 >= this.bg.displayHeight;
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
      key: "match",
      frames: this.anims.generateFrameNumbers("pal", {
        frames: [...Array(12).keys()].map((v) => v + 12 + 7),
      }),
      frameRate: 20,
      repeat: 0,
    });
    this.anims.create({
      key: "wrong",
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
    this.yesButton = addImage(this, "buttonYes", undefined, {
      bg: isMobile ? this.bg : this.screen,
      widthRel: 0.3,
      yAnchor: Anchor.end,
      xAnchor: Anchor.start,
    });
    this.yesButton.setY(this.yesButton.y + this.yesButton.displayHeight);
    this.yesText = addText(this, "Good", {
      bg: this.yesButton,
      heightRel: 0.5,
    });
    this.noButton = addImage(this, "buttonNo", undefined, {
      bg: isMobile ? this.bg : this.screen,
      widthRel: 0.3,
      yAnchor: Anchor.end,
      xAnchor: Anchor.end,
    });
    this.noButton.setY(this.noButton.y + this.noButton.displayHeight);
    this.noText = addText(this, "Bad", {
      bg: this.noButton,
      heightRel: 0.5,
    });
    this.yesButton.setAlpha(0);
    this.yesText.setAlpha(0);
    this.noButton.setAlpha(0);
    this.noText.setAlpha(0);
    if (this.config?.playManually) {
      this.createMenu("Bought or Not?");
    }
  }

  async createMenu(title: string, good?: boolean) {
    const pause = good !== undefined;
    if (pause) {
      this.pause(true);
      if (good) {
        this.noButton?.setAlpha(0.1);
        this.noText?.setAlpha(0.1);
      } else {
        this.yesButton?.setAlpha(0.1);
        this.yesText?.setAlpha(0.1);
      }
    }
    scaleText(this, this.screenText!, title);
    if (this.config?.playManually || pause) {
      const isMobile =
        this.cameras.main.displayHeight / 2 >= this.bg!.displayHeight;
      const button = addImage(this, "button", undefined, {
        bg: isMobile ? this.bg : this.screen,
        yAnchor: Anchor.end,
        widthRel: 0.3,
      });
      button.setY(button.y + button.displayHeight);
      const buttonText = addText(this, pause ? "Continue" : "Start!", {
        bg: button,
        heightRel: 0.5,
      });
      button.setInteractive();
      button.on(
        "pointerdown",
        () => {
          if (pause) {
            this.pause(false);
          } else {
            this.sound.play("match");
            this.start();
          }
          buttonText.destroy();
          button.destroy();
          this.yesButton?.setAlpha(1);
          this.yesText?.setAlpha(1);
          this.noButton?.setAlpha(1);
          this.noText?.setAlpha(1);
        },
        this
      );
      if (this.config?.playManually && pause) {
        await new Promise((res) => setTimeout(res, 1000));
        this.pause(false);
        button.destroy();
        buttonText.destroy();
        this.yesButton?.setAlpha(1);
        this.yesText?.setAlpha(1);
        this.noButton?.setAlpha(1);
        this.noText?.setAlpha(1);
      }
    }
  }

  start() {
    this.truePositive = 0;
    this.trueNegative = 0;
    this.falsePositive = 0;
    this.falseNegative = 0;
    this.items.forEach((i) => i.destroy());
    this.items = [];
    this.itemIdx = 0;
    this.yesButton?.setAlpha(1);
    this.yesText?.setAlpha(1);
    this.noButton?.setAlpha(1);
    this.noText?.setAlpha(1);
    // enable buttons
    if (this.config?.playManually) {
      this.config.simulation = this.config.simulator.play();
      this.yesButton?.setInteractive();
      this.yesButton?.on("pointerdown", () => this.selectItem(), this);
      this.noButton?.setInteractive();
      this.noButton?.on("pointerdown", () => this.trashItem(), this);
    }
    // spawn and timer events
    this.timerEvent = this.time.addEvent({
      delay: GAME_TIME * 1000,
      timeScale: this.speed,
      callback: this.gameOver,
      callbackScope: this,
    });
    this.spawnEvent = this.time.addEvent({
      delay: SPAWN_TIME,
      startAt: SPAWN_TIME,
      timeScale: this.speed,
      loop: true,
      callback: this.spawn,
      callbackScope: this,
    });
    this.pause(false);
  }

  update() {
    if (!this.timerEvent) {
      return;
    }
    const acc = Math.round(
      ((this.truePositive + this.trueNegative) / (this.itemIdx + 1)) * 100
    );
    if (this.timerEvent.getProgress() === 1) {
      scaleText(this, this.scoreText!, `Time: 00:00 | Accuracy: ${acc}%`);
      return;
    }
    const remaining = this.timerEvent.getRemainingSeconds().toPrecision(4);
    const pos = remaining.indexOf(".");
    const ms = remaining.substr(pos + 1, 2);
    let seconds = remaining.substring(0, pos);
    seconds = Phaser.Utils.String.Pad(seconds, 2, "0", 1);
    scaleText(
      this,
      this.scoreText!,
      `Time: ${seconds}:${ms} | Accuracy: ${acc}%`
    );
    if (this.trashText.length > 0) {
      scaleText(this, this.trashText[0], `${this.truePositive}`);
      scaleText(this, this.trashText[1], `${this.falsePositive}`);
      scaleText(this, this.trashText[2], `${this.trueNegative}`);
      scaleText(this, this.trashText[3], `${this.falseNegative}`);
    }
    this.items = this.items.filter((f) => f.state !== "deleted");
  }

  spawn() {
    if (!this.config || !this.config.simulation || !this.bg) {
      return;
    }
    const simulation = this.config.simulation as CafeSimulationOutput;
    const spawn = simulation.spawns[this.itemIdx];
    if (spawn) {
      scaleText(this, this.screenText!, spawn.review.review);
    }
    const item = addSprite(this, `box${randomInt(10) + 1}`, undefined, {
      bg: this.bg,
      xAnchor: Anchor.start,
      yAnchor: Anchor.end,
      y: this.bg.displayHeight * -0.05,
      heightRel: 0.2,
    });
    item.setData("review", spawn.review.review);
    item.setData("rating", spawn.review.rating);
    item.setData("idx", this.itemIdx);
    const response = spawn.classifierOutput;
    if (response) {
      this.time.addEvent({
        delay: SPAWN_TIME - response.confidence * SPAWN_TIME,
        timeScale: this.speed,
        callback: () => {
          if (response.classifierLabel === 1) {
            this.selectItem();
          } else {
            this.trashItem();
          }
        },
        callbackScope: this,
      });
    }
    this.tweens.add({
      targets: item,
      x: this.bg.displayWidth * 0.95,
      duration: SPAWN_TIME / this.speed,
      onComplete: () => {
        if (item.state !== "deleted") {
          this.deleteItem(item);
        }
      },
    });
    this.itemIdx++;
    this.items.push(item);
  }

  selectItem() {
    const item = this.items.find((i) => i.state !== "deleted");
    if (!item) return;
    if (item.data.list["rating"] === 1) {
      this.moveItem(item, "trueP");
    } else {
      this.moveItem(item, "falseP");
    }
  }

  trashItem() {
    const item = this.items.find((i) => i.state !== "deleted");
    if (!item) return;
    if (item.data.list["rating"] === 0) {
      this.moveItem(item, "trueN");
    } else {
      this.moveItem(item, "falseN");
    }
  }

  deleteItem(item: Phaser.GameObjects.Sprite) {
    item.state = "deleted";
    item.destroy();
  }

  moveItem(
    item: Phaser.GameObjects.Sprite,
    type: "trueP" | "falseP" | "trueN" | "falseN"
  ) {
    let destination: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite;
    let response = "";
    if (type === "trueP") {
      this.truePositive++;
      destination = this.trash[0];
      response = "match";
    }
    if (type === "falseP") {
      this.falsePositive++;
      destination = this.trash[1];
      response = "wrong";
      this.createMenu(item.data.list["review"], false);
    }
    if (type === "trueN") {
      this.trueNegative++;
      destination = this.trash[2];
      response = "match";
    }
    if (type === "falseN") {
      this.falseNegative++;
      destination = this.trash[3];
      response = "wrong";
      this.createMenu(item.data.list["review"], true);
    }
    this.sound.play(response);
    this.pal?.play(response);
    // item flys to destination
    this.tweens.add({
      targets: item,
      x: destination!.x,
      y: destination!.y,
      delay: 50 / this.speed,
      duration: 300 / this.speed,
      ease: "sine.inout",
      onComplete: () => {
        this.deleteItem(item);
        this.tweens.add({
          targets: destination,
          scale: 1.4,
          angle: "-=30",
          yoyo: true,
          ease: "sine.inout",
          duration: 100 / this.speed,
        });
      },
    });
  }

  gameOver() {
    this.timerEvent?.remove();
    this.spawnEvent?.remove();
    this.eventSystem?.emit("gameOver");
    this.yesButton?.setAlpha(0);
    this.yesText?.setAlpha(0);
    this.noButton?.setAlpha(0);
    this.noText?.setAlpha(0);
    this.pause(true);
    this.items.forEach((i) => i.destroy());
    this.createMenu("Game Over!");
  }

  mute(muted: boolean) {
    this.isMuted = muted;
    this.sound.mute = muted;
  }

  pause(paused: boolean) {
    this.isPaused = paused;
    this.time.paused = this.isPaused;
    if (this.isPaused) {
      this.tweens.pauseAll();
    } else {
      this.tweens.resumeAll();
    }
  }

  changeSpeed(speed: number) {
    this.speed = speed;
    this.physics.config.timeScale = this.speed;
    this.time.timeScale = this.speed;
  }
}
