/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import Phaser from "phaser";
import {
  ITEM_TIME,
  GAME_TIME,
  SPAWN_TIME,
  CLASSIFIER_DELAY,
  CafeSimulation,
} from "./simulator";
import { GameParams } from "..";
import { addImage, addSprite, addText, scaleText } from "../phaser-helpers";

export default class MainGame extends Phaser.Scene {
  speed: number;
  isPaused: boolean;
  isMuted: boolean;
  score: number;
  numCorrect: number;
  items: Phaser.GameObjects.Sprite[];
  itemIdx: number;
  trash?: Phaser.GameObjects.Sprite;
  bear?: Phaser.GameObjects.Image;
  speech?: Phaser.GameObjects.Image;
  bgBot?: Phaser.GameObjects.Image;
  offset: number;
  text?: Phaser.GameObjects.Text;
  timerText?: Phaser.GameObjects.Text;
  scoreText?: Phaser.GameObjects.Text;
  accuracyText?: Phaser.GameObjects.Text;
  timerEvent?: Phaser.Time.TimerEvent;
  spawnEvent?: Phaser.Time.TimerEvent;
  config?: GameParams<CafeSimulation>;
  eventSystem?: Phaser.Events.EventEmitter;

  constructor() {
    super("MainGame");
    this.speed = 1;
    this.isPaused = false;
    this.isMuted = false;
    this.score = 0;
    this.numCorrect = 0;
    this.items = [];
    this.itemIdx = 0;
    this.offset = 0;
  }

  preload() {
    this.load.setPath("assets/cafe");
    this.load.image("background", "background.png");
    this.load.setPath("assets/cafe/sprites");
    this.load.atlas("bg_kitchen", "bg_kitchen.png", "bg_kitchen.json");
    this.load.atlas("char_bears", "char_bears.png", "char_bears.json");
    this.load.atlas("char_speech", "char_speech.png", "char_speech.json");
    this.load.atlas("food", "food.png", "food.json");
    this.load.setPath("assets/cafe/sounds");
    this.load.audio("match", ["match.ogg", "match.mp3"]);
  }

  create(data: GameParams<CafeSimulation>) {
    this.config = data;
    this.eventSystem = data.eventSystem;
    this.mute(data.isMuted);
    this.changeSpeed(data.speed);
    // create scene
    this.cameras.main.setBackgroundColor("#4f4135");
    const bgTop = addImage(this, "background", undefined, { widthScale: 1 });
    this.bear = addImage(this, "char_bears", "brown", {
      height: bgTop.displayHeight / 3,
    });
    this.bear.setY(this.bear.y - (bgTop.displayHeight / 8 + 5));
    this.speech = addImage(this, "char_speech", "...", {
      height: bgTop.displayHeight / 4,
    });
    this.speech.setX(this.speech.x - this.bear.displayWidth / 2);
    this.speech.setY(this.speech.y - this.bear.displayHeight);
    this.bgBot = addImage(this, "bg_kitchen", "bottom", {
      width: bgTop.displayWidth,
      y: bgTop.displayHeight / 2,
    });
    this.trash = addSprite(this, "bg_kitchen", "trash", {
      height: this.bgBot.displayHeight / 2,
      y: bgTop.displayHeight / 2,
      xRel: 1,
    });
    this.trash.state = "trash";
    this.timerText = addText(this, `Time: ${GAME_TIME}:00`, {
      x: 5,
      width: 0.5,
      maxFontSize: 32,
    });
    this.scoreText = addText(this, "Score: 0", {
      x: -5,
      xRel: 1,
      width: 0.5,
      maxFontSize: 32,
    });
    if (!this.config.playManually) {
      this.accuracyText = addText(this, "Accuracy: 0", {
        x: -5,
        yRel: 0.1,
        xRel: 1,
        width: 0.5,
        maxFontSize: 32,
      });
    }
    const yTextOffset =
      (this.cameras.main.displayHeight - bgTop.displayHeight) / 2 +
      bgTop.displayHeight / 2 +
      this.bgBot.displayHeight / 2;
    const maxTextWidth =
      this.cameras.main.displayWidth - this.trash.displayWidth;
    this.text = addText(this, " ", {
      x: 5,
      y: yTextOffset,
      yRel: 0,
      maxWidth: maxTextWidth,
    });
    this.text.state = "text";
    // start
    this.eventSystem.on("pause", this.pause, this);
    this.eventSystem.on("mute", this.mute, this);
    this.eventSystem.on("changeSpeed", this.changeSpeed, this);
    this.start();
  }

  start() {
    if (this.config?.playManually) {
      this.config.simulation = this.config.simulator.play();
      this.trash?.setInteractive();
      this.text?.setInteractive();
      this.input.on("gameobjectdown", this.selectItem, this);
    }
    this.score = 0;
    this.numCorrect = 0;
    this.items = [];
    this.itemIdx = 0;
    this.bear?.setTexture("char_bears", this.config?.simulation?.customer);
    // spawn and timer events
    let a2 = 1;
    this.time.addEvent({
      delay: 500,
      timeScale: this.speed,
      loop: true,
      callback: () => {
        this.speech!.y = this.speech!.y + 2 * a2;
        a2 *= -1;
      },
      callbackScope: this,
    });
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
  }

  update() {
    if (!this.timerEvent) {
      return;
    }
    if (this.timerEvent.getProgress() === 1) {
      scaleText(this, this.timerText!, "Time: 00:00");
      return;
    }
    const remaining = this.timerEvent.getRemainingSeconds().toPrecision(4);
    const pos = remaining.indexOf(".");
    const ms = remaining.substr(pos + 1, 2);
    let seconds = remaining.substring(0, pos);
    seconds = Phaser.Utils.String.Pad(seconds, 2, "0", 1);
    scaleText(this, this.timerText!, `Time: ${seconds}:${ms}`);
    this.items = this.items.filter((f) => f.state !== "deleted");
  }

  spawn() {
    if (!this.config || !this.config.simulation) {
      return;
    }
    const simulation = this.config.simulation;
    const spawn = simulation.spawns[this.itemIdx];
    const item = addSprite(this, "food", spawn.item, {
      height: this.bgBot!.displayHeight / 1.5,
    });
    item.setX(0);
    item.setData("review", spawn.review.review);
    item.setData("rating", spawn.review.rating);
    item.setData("idx", this.itemIdx);
    if (this.config.playManually) {
      item.setInteractive();
    } else {
      const response = spawn.classifierOutput;
      if (response) {
        if (response.classifierLabel === response.realLabel) {
          this.numCorrect++;
          const acc = Math.round((this.numCorrect / (this.itemIdx + 1)) * 100);
          scaleText(this, this.accuracyText!, `Accuracy: ${acc}%`);
        }
        this.time.addEvent({
          delay: CLASSIFIER_DELAY - response.confidence * CLASSIFIER_DELAY,
          timeScale: this.speed,
          callback: () => {
            if (response.classifierLabel === 1) {
              this.selectItem(undefined, item);
            } else {
              this.trashItem();
            }
          },
          callbackScope: this,
        });
      }
    }
    this.tweens.add({
      targets: item,
      x: this.bgBot?.displayWidth,
      duration: (ITEM_TIME * 1000) / this.speed,
      onComplete: () => {
        if (item.state !== "deleted") {
          this.deleteItem(item);
        }
      },
    });
    if (this.items.length === 0) {
      scaleText(this, this.text!, spawn.review.review);
    }
    this.items.push(item);
    this.itemIdx++;
  }

  selectItem(
    _pointer: Phaser.Input.Pointer | undefined,
    item: Phaser.GameObjects.Sprite
  ) {
    if (item.state === "trash") {
      this.trashItem();
      return;
    }
    if (item.state === "text") {
      const i = this.items.find((i) => i.state !== "deleted");
      if (!i) {
        return;
      }
      item = i;
    }
    if (item.data.list["rating"] === 1) {
      this.goodResponse(item);
    } else {
      this.badResponse(item);
    }
    scaleText(this, this.scoreText!, `Score: ${this.score}`);
  }

  trashItem() {
    const item = this.items.find((i) => i.state !== "deleted");
    if (item) {
      if (item.data.list["rating"] === 0) {
        this.goodResponse(item);
      } else {
        this.badResponse(item);
      }
      this.tweens.add({
        targets: item,
        x: this.trash!.x,
        y: this.trash!.y,
        duration: 200 / this.speed,
        ease: "sine.inout",
        onComplete: () => {
          this.speech?.setTexture("char_speech", "...");
          this.deleteItem(item);
        },
      });
    }
  }

  goodResponse(item: Phaser.GameObjects.Sprite) {
    this.speech?.setTexture("char_speech", "good");
    this.score++;
    this.time.addEvent({
      delay: 100,
      timeScale: this.speed,
      repeat: 3,
      callback: () => {
        if (this.bear!.frame.name.endsWith("2")) {
          this.bear!.setTexture(
            "char_bears",
            this.bear!.frame.name.slice(0, -1)
          );
        } else {
          this.bear!.setTexture("char_bears", `${this.bear!.frame.name}2`);
        }
      },
      callbackScope: this,
    });
    this.tweens.add({
      targets: item,
      scale: 1.4,
      angle: "-=30",
      yoyo: true,
      ease: "sine.inout",
      duration: 100 / this.speed,
      onComplete: () => {
        this.speech?.setTexture("char_speech", "...");
        this.deleteItem(item);
      },
    });
    this.sound.play("match");
  }

  badResponse(item: Phaser.GameObjects.Sprite) {
    this.speech?.setTexture("char_speech", "bad");
    this.score--;
    let a1 = false;
    this.time.addEvent({
      delay: 100,
      timeScale: this.speed,
      repeat: 3,
      callback: () => {
        a1 = !a1;
        this.bear!.flipX = a1;
      },
      callbackScope: this,
    });
    this.tweens.add({
      targets: item,
      alpha: 0,
      yoyo: true,
      repeat: 2,
      duration: 100 / this.speed,
      ease: "sine.inout",
      onComplete: () => {
        this.speech?.setTexture("char_speech", "...");
        this.deleteItem(item);
      },
    });
  }

  deleteItem(item: Phaser.GameObjects.Sprite) {
    item.state = "deleted";
    item.destroy();
    scaleText(
      this,
      this.text!,
      this.items.find((i) => i.state !== "deleted")?.data.list["review"] || ""
    );
  }

  gameOver() {
    this.spawnEvent?.remove();
    this.input.off("gameobjectdown", this.selectItem, this);
    this.eventSystem?.emit("gameOver");
  }

  mute(muted: boolean) {
    this.isMuted = muted;
    this.sound.mute = muted;
  }

  pause(paused: boolean) {
    this.isPaused = paused;
    this.time.paused = this.isPaused;
  }

  changeSpeed(speed: number) {
    this.speed = speed;
    this.physics.config.timeScale = this.speed;
    this.time.timeScale = this.speed;
  }
}
