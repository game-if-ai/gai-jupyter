/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import Phaser from "phaser";
import { GameParams } from "..";
import {
  ITEM_TIME,
  GAME_TIME,
  SPAWN_TIME,
  CLASSIFIER_DELAY,
  CafeSimulation,
} from "./simulator";

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
  fontFamily: "Arial",
  fontStyle: "bold",
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

export default class MainGame extends Phaser.Scene {
  speed: number;
  isPaused: boolean;
  isMuted: boolean;
  score: number;
  numCorrect: number;
  numTotal: number;

  items: Phaser.GameObjects.Sprite[];
  itemIdx: number;
  trash?: Phaser.GameObjects.Sprite;
  bear?: Phaser.GameObjects.Image;
  speech?: Phaser.GameObjects.Image;

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
    this.numTotal = 0;
    this.items = [];
    this.itemIdx = 0;
  }

  preload() {
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
    // upper bg
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
    // character sprites
    this.bear = this.add.image(320, 145, "char_bears", "brown").setScale(2);
    this.speech = this.add.image(320, 110, "char_speech", "...").setScale(2);
    // lower bg
    this.add.image(320, 260, "bg_kitchen", "bottom").setScale(2);
    this.add.image(485, 330, "bg_kitchen", "divider").setScale(2);
    this.add.image(568, 330, "bg_kitchen", "shelf").setScale(2);
    this.trash = this.add.sprite(570, 345, "bg_kitchen", "trash").setScale(2);
    this.trash.state = "trash";
    // text
    this.timerText = this.add.text(5, 5, `Time: ${GAME_TIME}:00`, fontStyle);
    this.scoreText = this.add.text(565, 5, "Score: 0", fontStyle);
    this.accuracyText = this.add.text(565, 20, "Accuracy: 100%", fontStyle);
    this.text = this.add.text(5, 290, "", labelFont);
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
      this.input.on("gameobjectdown", this.selectItem, this);
    }
    this.score = 0;
    this.numCorrect = 0;
    this.numTotal = 0;
    this.items = [];
    this.itemIdx = 0;
    this.timerText?.setText(`Time: ${GAME_TIME}:00`);
    this.scoreText?.setText("Score: 0");
    this.accuracyText?.setText("Accuracy: 100%");
    this.text?.setText("");
    // animations
    this.bear?.setTexture("char_bears", this.config?.simulation?.customer);
    this.time.addEvent({
      delay: 200,
      timeScale: this.speed,
      loop: true,
      callback: () => {
        if (this.bear!.frame.name.endsWith("2")) {
          this.bear!.setTexture(
            "char_bears",
            this.bear!.frame.name.split("2")[0]
          );
        } else {
          this.bear!.setTexture("char_bears", `${this.bear!.frame.name}2`);
        }
      },
      callbackScope: this,
    });
    this.time.addEvent({
      delay: 500,
      timeScale: this.speed,
      loop: true,
      callback: () => {
        this.bear!.flipX = !this.bear!.flipX;
        if (this.bear!.frame.name.endsWith("2")) {
          this.speech!.y = 108;
        } else {
          this.speech!.y = 110;
        }
      },
      callbackScope: this,
    });
    // spawn and timer events
    this.timerEvent = this.time.addEvent({
      delay: GAME_TIME * 1000,
      timeScale: this.speed,
      callback: this.gameOver,
      callbackScope: this,
    });
    this.spawnEvent = this.time.addEvent({
      delay: SPAWN_TIME,
      timeScale: this.speed,
      loop: true,
      callback: this.spawn,
      callbackScope: this,
    });
    this.spawn();
  }

  update() {
    if (!this.timerEvent) {
      return;
    }
    if (this.timerEvent.getProgress() === 1) {
      this.timerText?.setText("Time: 00:00");
      return;
    }
    const remaining = this.timerEvent.getRemainingSeconds().toPrecision(4);
    const pos = remaining.indexOf(".");
    const ms = remaining.substr(pos + 1, 2);
    let seconds = remaining.substring(0, pos);
    seconds = Phaser.Utils.String.Pad(seconds, 2, "0", 1);
    this.timerText?.setText(`Time: ${seconds + ":" + ms}`);
    this.items = this.items.filter((f) => f.state !== "deleted");
  }

  spawn() {
    if (!this.config || !this.config.simulation) {
      return;
    }
    const simulation = this.config.simulation;
    const spawn = simulation.spawns[this.itemIdx];
    const item = this.add.sprite(0, 200, "food", spawn.item).setScale(2);
    item.setData("review", spawn.review.review);
    item.setData("rating", spawn.review.rating);
    item.setData("idx", this.itemIdx);
    if (this.config.playManually) {
      item.setInteractive();
    } else {
      const response = spawn.classifierOutput;
      if (response) {
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
      x: 800,
      duration: (ITEM_TIME * 1000) / this.speed,
      onComplete: () => {
        if (item.state !== "deleted") {
          this.deleteItem(item);
        }
      },
    });
    if (this.items.length === 0) {
      this.text?.setText(spawn.review.review);
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
    if (item.data.list["rating"] === 1) {
      this.speech?.setTexture("char_speech", "good");
      this.score++;
      this.numCorrect++;
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
    } else {
      this.speech?.setTexture("char_speech", "bad");
      this.score--;
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
    this.scoreText?.setText("Score: " + this.score);
  }

  trashItem() {
    const cur = this.items.find((i) => i.state !== "deleted");
    if (cur) {
      if (cur.data.list["rating"] === 0) {
        this.speech?.setTexture("char_speech", "good");
        this.numCorrect++;
        this.sound.play("match");
      } else {
        this.speech?.setTexture("char_speech", "bad");
      }
      this.tweens.add({
        targets: cur,
        x: 570,
        y: 345,
        duration: 200 / this.speed,
        ease: "sine.inout",
        onComplete: () => {
          this.speech?.setTexture("char_speech", "...");
          this.deleteItem(cur);
        },
      });
    }
  }

  deleteItem(item: Phaser.GameObjects.Sprite) {
    this.numTotal++;
    item.state = "deleted";
    item.destroy();
    this.text?.setText(
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
