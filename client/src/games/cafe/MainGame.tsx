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
  wordWrap: { width: 250 },
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

  items: Phaser.GameObjects.Sprite[];
  itemIdx: number;
  trash?: Phaser.GameObjects.Sprite;
  bear?: Phaser.GameObjects.Image;
  speech?: Phaser.GameObjects.Image;
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
    this.cameras.main.setBackgroundColor("#4f4135");
    this.offset =
      this.game.canvas.height > 180 ? (this.game.canvas.height / 2) % 180 : 0;
    // upper bg
    this.add.image(160, 90 + this.offset, "bg_kitchen", "top");
    this.add.image(120, 20 + this.offset, "bg_kitchen", "hanging_plant").flipX =
      true;
    this.add.image(200, 20 + this.offset, "bg_kitchen", "hanging_plant");
    this.add.image(75, 10 + this.offset, "bg_kitchen", "hanging_light");
    this.add.image(245, 10 + this.offset, "bg_kitchen", "hanging_light");
    this.add.image(100, 62 + this.offset, "bg_kitchen", "plant1");
    this.add.image(160, 62 + this.offset, "bg_kitchen", "plant1");
    this.add.image(220, 62 + this.offset, "bg_kitchen", "plant1");
    this.add.image(60, 57 + this.offset, "bg_kitchen", "plant2");
    this.add.image(260, 57 + this.offset, "bg_kitchen", "plant2");
    this.add.image(17, 45 + this.offset, "bg_kitchen", "painting1");
    this.add.image(302, 45 + this.offset, "bg_kitchen", "painting2");
    this.add.image(17, 18 + this.offset, "bg_kitchen", "clock");
    // character sprites
    this.bear = this.add
      .image(160, 72 + this.offset, "char_bears", "brown")
      .setScale(2);
    this.speech = this.add
      .image(160, 35 + this.offset, "char_speech", "...")
      .setScale(2.5);
    // lower bg
    this.add.image(160, 130 + this.offset, "bg_kitchen", "bottom");
    this.add.image(242.5, 165 + this.offset, "bg_kitchen", "divider");
    this.trash = this.add.sprite(285, 172 + this.offset, "bg_kitchen", "trash");
    this.trash.state = "trash";
    // text
    this.timerText = this.add.text(5, 5, `Time: ${GAME_TIME}:00`, fontStyle);
    this.scoreText = this.add.text(-5, 5, "Score: 0", {
      ...fontStyle,
      fixedWidth: Number(this.game.config.width),
      align: "right",
    });
    if (!this.config.playManually) {
      this.accuracyText = this.add.text(-5, 25, "Accuracy: 100%", {
        ...fontStyle,
        fixedWidth: Number(this.game.config.width),
        align: "right",
      });
    }
    this.text = this.add.text(5, 145 + this.offset, "", labelFont);
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
          this.speech!.y = 34 + this.offset;
        } else {
          this.speech!.y = 35 + this.offset;
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
    const item = this.add
      .sprite(0, 100 + this.offset, "food", spawn.item)
      .setScale(3);
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
          this.accuracyText?.setText(`Accuracy: ${acc}%`);
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
      x: 320,
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
    if (item.state === "text") {
      const i = this.items.find((i) => i.state !== "deleted");
      if (!i) {
        return;
      }
      item = i;
    }
    if (item.data.list["rating"] === 1) {
      this.speech?.setTexture("char_speech", "good");
      this.score++;
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
        this.sound.play("match");
      } else {
        this.speech?.setTexture("char_speech", "bad");
      }
      this.tweens.add({
        targets: cur,
        x: 285,
        y: 172 + this.offset,
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
