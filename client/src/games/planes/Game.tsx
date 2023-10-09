/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import Phaser from "phaser";
import {
  SPAWN_TIME,
  GAME_TIME,
  PlaneSimulationOutput,
  VehicleTypes,
  CLASSIFIER_DELAY,
} from "./simulator";
import { GameParams } from "..";
import {
  addBackground,
  addImage,
  addSprite,
  addText,
  Anchor,
  scaleText,
} from "../phaser-helpers";
import { randomInt } from "../../utils";

export default class MainGame extends Phaser.Scene {
  speed: number;
  isPaused: boolean;
  isMuted: boolean;
  config?: GameParams;
  eventSystem?: Phaser.Events.EventEmitter;
  timerEvent?: Phaser.Time.TimerEvent;
  spawnEvent?: Phaser.Time.TimerEvent;

  bg?: Phaser.GameObjects.Image;
  bins: Record<string, Phaser.GameObjects.Sprite>;
  scoreText?: Phaser.GameObjects.Text;

  items: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[];
  rects: Phaser.GameObjects.Rectangle[];
  itemIdx: number;
  numCorrect: number;

  constructor() {
    super("Game");
    this.speed = 1;
    this.isPaused = false;
    this.isMuted = false;
    this.numCorrect = 0;
    this.itemIdx = 0;
    this.items = [];
    this.rects = [];
    this.bins = {};
  }

  preload() {
    this.load.setPath("assets");
    this.load.image(
      "button",
      "wordui/buttons/long_buttons/blue_button_complete.png"
    );
    this.load.setPath("assets/planes");
    this.load.image(`background`, `background.jpg`);
    this.load.image(`background2`, `background2.jpg`);
    for (let i = 0; i < 100; i++) {
      this.load.image(`car${i}`, `cars/automobile_${800 + i}.png`);
      this.load.image(`plane${i}`, `planes/airplane_${i}.png`);
      this.load.image(`tank${i}`, `tanks/tank_${1600 + i}.png`);
    }
    for (let i = 1; i <= 3; i++) {
      this.load.image(`crate${i}`, `crate${i}.jpg`);
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
    const bg = addBackground(this, "background");
    this.bg = bg;
    bg.setY(0 + bg.displayHeight / 2);
    let bgHeight = bg.displayHeight;
    while (bgHeight <= this.cameras.main.displayHeight) {
      const bg2 = addImage(this, "background", undefined, { bg, widthRel: 1 });
      bg2.setY(bgHeight + bg2.displayHeight * 0.3);
      bgHeight += bg2.displayHeight;
    }
    const bgBot = addImage(this, "background2", undefined, { bg, widthRel: 1 });
    bgBot.setY(camera.displayHeight - bgBot.displayHeight * 0.5);
    // add crates
    for (let i = 0; i < 3; i++) {
      const crate = addSprite(this, `crate${i + 1}`);
      crate.setDisplaySize(bgBot.displayWidth / 3, bgBot.displayHeight / 2);
      crate.setX(bgBot.displayWidth / 6 + (bgBot.displayWidth / 3) * i);
      crate.setY(camera.displayHeight - bgBot.displayHeight / 4);
      const dropZone = this.add
        .zone(crate.x, crate.y, crate.displayWidth, crate.displayHeight)
        .setRectangleDropZone(crate.displayWidth, crate.displayHeight);
      dropZone.name = VehicleTypes[i];
      const trashText = addText(this, VehicleTypes[i].toUpperCase(), {
        bg: crate,
        xAnchor: Anchor.center,
        yAnchor: Anchor.center,
        widthRel: 1,
        maxFontSize: 36,
      });
      trashText.depth = 1;
      this.bins[VehicleTypes[i]] = crate;
    }
    // add text
    this.scoreText = addText(this, "Time: 120:00 | Accuracy: 100%", {
      bg,
      xAnchor: Anchor.start,
      yAnchor: Anchor.start,
      heightRel: 0.05,
      maxFontSize: 32,
    });
    // add buttons
    if (this.config?.playManually) {
      this.createMenu("Cars, Planes, or Trains?");
    }
  }

  async createMenu(title: string, pause = false) {
    if (pause) {
      this.pause(true);
    }
    const text = addText(this, title, {
      bg: this.bg,
      widthRel: 0.9,
      maxFontSize: 78,
    });
    text.setY(0 + text.displayHeight);
    if (this.config?.playManually || pause) {
      const button = addImage(this, "button", undefined, {
        bg: this.bg,
        widthRel: 0.3,
      });
      button.setY(text.y + text.displayHeight + button.displayHeight);
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
          text.destroy();
          buttonText.destroy();
          button.destroy();
        },
        this
      );
      if (this.config?.playManually && pause) {
        await new Promise((res) => setTimeout(res, 1000));
        this.pause(false);
        text.destroy();
        buttonText.destroy();
        button.destroy();
      }
    }
  }

  start() {
    this.numCorrect = 0;
    this.itemIdx = 0;
    this.items.forEach((i) => i.destroy());
    this.rects.forEach((i) => i.destroy());
    this.items = [];
    this.rects = [];
    if (this.config?.playManually) {
      this.config.simulation = this.config.simulator.play();
      this.input.on(
        "drag",
        function (
          _pointer: any,
          item: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
          dragX: number,
          dragY: number
        ) {
          if (!item.name) return;
          item.x = dragX;
          item.y = dragY;
        }
      );
    }
    // add events
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
    const acc = Math.round((this.numCorrect / (this.itemIdx + 1)) * 100);
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
    // check collision
    if (this.config?.playManually) {
      this.items.forEach((i) => {
        if (!i.name) return;
        VehicleTypes.forEach((v) => {
          if (
            Phaser.Geom.Intersects.RectangleToRectangle(
              i.getBounds(),
              this.bins[v].getBounds()
            )
          ) {
            this.drop(i, v);
          }
        });
      });
    }
  }

  spawn() {
    if (!this.config || !this.config.simulation) {
      return;
    }
    const simulation = this.config.simulation as PlaneSimulationOutput;
    const spawn = simulation.spawns[this.itemIdx];
    const response = spawn.classifierOutput;
    const object = this.physics.add.sprite(
      this.cameras.main.displayWidth * spawn.xPos,
      0,
      `${spawn.type}${randomInt(99)}`
    );
    object.setDisplaySize(100, 100);
    object.name = spawn.type;
    if (response) {
      const delay = CLASSIFIER_DELAY + response.confidence * CLASSIFIER_DELAY;
      const bin = this.bins[response.classifierLabel];
      this.tweens.add({
        targets: object,
        x: bin.x - bin.displayWidth / 2 + Math.random() * bin.displayWidth,
        y: bin.y - bin.displayHeight / 2 + Math.random() * bin.displayHeight,
        delay: delay / this.speed,
        duration: 300 / this.speed,
        ease: "sine.inout",
        onComplete: () => {
          this.drop(object, response.classifierLabel);
        },
      });
    } else {
      object.setInteractive();
      this.input.setDraggable(object);
    }
    this.itemIdx++;
    this.items.push(object);
  }

  drop(item: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, bin: string) {
    if (!item.name) return;
    const name = item.name;
    item.name = "";
    // if the gameObject and zone match
    if (name === bin) {
      this.sound.play("match");
      this.numCorrect++;
    } else {
      this.sound.play("wrong");
      this.createMenu(`Wrong: ${bin}\nCorrect: ${name}`, true);
    }
    item.body.moves = false;
    if (this.config?.playManually) {
      item.disableInteractive();
      this.input.setDraggable(item, false);
    }
    this.tweens.add({
      targets: item,
      scale: 1.4,
      angle: "-=30",
      yoyo: true,
      ease: "sine.inout",
      duration: 100,
      onComplete: () => {
        const rect = this.add.rectangle(
          item.x,
          item.y,
          item.displayWidth,
          item.displayHeight,
          name === bin ? 0x00ff00 : 0xff0000,
          0.25
        );
        this.rects.push(rect);
      },
    });
  }

  gameOver() {
    this.input.off("drag");
    this.timerEvent?.remove();
    this.spawnEvent?.remove();
    this.eventSystem?.emit("gameOver");
    this.pause(true);
    this.items.forEach((i) => {
      if (i.name) {
        i.destroy();
      }
    });
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
      this.physics.world.pause();
      this.tweens.pauseAll();
    } else {
      this.physics.world.resume();
      this.tweens.resumeAll();
    }
  }

  changeSpeed(speed: number) {
    this.speed = speed;
    this.physics.config.timeScale = this.speed;
    this.time.timeScale = this.speed;
  }
}
