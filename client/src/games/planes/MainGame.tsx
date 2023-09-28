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
import { Bin } from "./MainMenu";
import { VehicleTypes } from "./types";

export default class MainGame extends Phaser.Scene {
  speed: number;
  isPaused: boolean;
  isMuted: boolean;
  config?: GameParams;
  eventSystem?: Phaser.Events.EventEmitter;
  timerEvent?: Phaser.Time.TimerEvent;
  spawnEvent?: Phaser.Time.TimerEvent;
  itemIdx: number;
  numCorrect: number;

  bg?: Phaser.GameObjects.Image;
  pal?: Phaser.GameObjects.Sprite;
  scoreText?: Phaser.GameObjects.Text;
  bins: Record<string, Bin>;

  constructor() {
    super("MainGame");
    this.speed = 1;
    this.isPaused = false;
    this.isMuted = false;
    this.numCorrect = 0;
    this.itemIdx = 0;
    this.bins = {};
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
    this.load.setPath("assets/planes");
    this.load.image(`background`, `background.jpg`);
    this.load.image(`background2`, `background2.jpg`);
    for (let i = 1; i <= 10; i++) {
      this.load.image(`car${i}`, `cars/automobile_${i}.png`);
      this.load.image(`plane${i}`, `planes/airplane_${i}.png`);
      this.load.image(`tank${i}`, `tanks/tank_${i}.png`);
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
    this.mute(data.isMuted);
    this.changeSpeed(data.speed);
    // add background
    const bg = addBackground(this, "background");
    bg.setY(0 + bg.displayHeight / 2);
    this.bg = bg;
    let bgHeight = bg.displayHeight;
    while (bgHeight <= this.cameras.main.displayHeight) {
      const bg2 = addImage(this, "background", undefined, { bg, widthRel: 1 });
      bg2.setY(bgHeight + bg2.displayHeight * 0.3);
      bgHeight += bg2.displayHeight;
    }
    const bgBot = addImage(this, "background2", undefined, { bg, widthRel: 1 });
    bgBot.setY(this.cameras.main.displayHeight - bgBot.displayHeight * 0.5);
    // add crates
    for (let i = 1; i <= 3; i++) {
      const crate = addSprite(this, `crate${i}`, undefined, {
        bg: bgBot,
        xAnchor: [Anchor.start, Anchor.center, Anchor.end][i - 1],
        yAnchor: Anchor.end,
        widthRel: 0.3,
        x: 0,
      });
      const dropZone = this.add
        .zone(crate.x, crate.y, crate.displayWidth, crate.displayHeight)
        .setRectangleDropZone(crate.displayWidth, crate.displayHeight);
      dropZone.name = VehicleTypes[i - 1];
      const trashText = addText(this, VehicleTypes[i - 1], {
        bg: crate,
        xAnchor: Anchor.center,
        yAnchor: Anchor.start,
        widthRel: 1,
        maxFontSize: 36,
      });
      trashText.depth = 1;
      trashText.setY(trashText.y - trashText.displayHeight / 2);
      this.bins[VehicleTypes[i - 1]] = {
        bin: crate,
        text: trashText,
        items: [],
      };
    }
    // add text
    this.scoreText = addText(this, "Time: 120:00 | Accuracy: 100%", {
      bg,
      xAnchor: Anchor.start,
      yAnchor: Anchor.start,
      heightRel: 0.05,
      maxFontSize: 32,
    });
    this.start();
  }

  start() {
    if (this.eventSystem) {
      this.eventSystem.on("pause", this.pause, this);
      this.eventSystem.on("mute", this.mute, this);
      this.eventSystem.on("changeSpeed", this.changeSpeed, this);
    }
    // add events
    this.timerEvent = this.time.addEvent({
      delay: GAME_TIME * 1000,
      timeScale: this.speed,
      callback: this.gameOver,
      callbackScope: this,
    });
    this.time.addEvent({
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
  }

  spawn() {
    if (!this.config || !this.config.simulation || !this.bg) {
      return;
    }
    const simulation = this.config.simulation as PlaneSimulationOutput;
    const spawn = simulation.spawns[this.itemIdx];
    const response = spawn.classifierOutput!;
    const object = this.physics.add.sprite(
      this.cameras.main.displayWidth * spawn.xPos,
      0,
      `${response.realLabel}${randomInt(10) + 1}`
    );
    object.setDisplaySize(50, 50);
    object.name = response.realLabel;

    const delay = CLASSIFIER_DELAY + response.confidence * CLASSIFIER_DELAY;
    const bin = this.bins[response.classifierLabel].bin;

    this.tweens.add({
      targets: object,
      x: bin.x - bin.displayWidth / 2 + Math.random() * bin.displayWidth,
      y: bin.y - bin.displayHeight / 2 + Math.random() * bin.displayHeight,
      delay: delay / this.speed,
      duration: 300 / this.speed,
      ease: "sine.inout",
      onComplete: () => {
        this.drag(object, response.classifierLabel);
      },
    });
    this.itemIdx++;
  }

  drag(item: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, bin: string) {
    // if the gameObject and zone match
    if (item.name === bin) {
      this.sound.play("match");
      this.numCorrect++;
    } else {
      this.sound.play("wrong");
    }
    item.body.moves = false;
    this.tweens.add({
      targets: item,
      scale: 1.4,
      angle: "-=30",
      yoyo: true,
      ease: "sine.inout",
      duration: 100,
      onComplete: () => {
        this.add.rectangle(
          item.x,
          item.y,
          item.displayWidth,
          item.displayHeight,
          item.name === bin ? 0x00ff00 : 0xff0000,
          0.25
        );
      },
    });
    this.bins[bin].items.push(item);
  }

  gameOver() {
    this.spawnEvent?.remove();
    this.eventSystem?.emit("gameOver");
    this.physics.world.pause();
    this.tweens.pauseAll();
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
