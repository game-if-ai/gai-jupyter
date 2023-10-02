/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import Phaser from "phaser";
import {
  CLASSIFIER_DELAY,
  FruitSimulationOutput,
  GAME_TIME,
  SPAWN_TIME,
} from "./simulator";
import { Fruits } from "./types";
import { GameParams } from "..";
import {
  addBackground,
  addImage,
  addText,
  Anchor,
  scaleText,
} from "../phaser-helpers";

export default class MainGame extends Phaser.Scene {
  speed: number;
  isPaused: boolean;
  isMuted: boolean;
  numCorrect: number;
  config?: GameParams;
  eventSystem?: Phaser.Events.EventEmitter;

  fruit: Phaser.GameObjects.Sprite[];
  fruitIdx: number;
  timerText?: Phaser.GameObjects.Text;
  accuracyText?: Phaser.GameObjects.Text;
  matchText?: Phaser.GameObjects.Text;
  timerEvent?: Phaser.Time.TimerEvent;
  spawnEvent?: Phaser.Time.TimerEvent;
  bg?: Phaser.GameObjects.Image;

  constructor() {
    super("Game");
    this.speed = 1;
    this.isPaused = false;
    this.isMuted = false;
    this.numCorrect = 0;
    this.fruit = [];
    this.fruitIdx = 0;
  }

  preload() {
    this.load.setPath("assets/fruit-picker");
    this.load.image("background", "background.jpg");
    this.load.image("logo", "logo.png");
    this.load.image("logo2", "logo2.png");
    for (const f of Fruits) {
      this.load.image(f.name, `fruit/${f.sprite}.png`);
    }
    this.load.setPath("assets/sounds");
    this.load.audio("music", ["music.ogg", "music.mp3"]);
    this.load.audio("countdown", ["countdown.ogg", "countdown.mp3"]);
    this.load.audio("match", ["match.ogg", "match.mp3"]);
  }

  create(data: GameParams) {
    this.config = data;
    this.createScene();
    // start game
    this.eventSystem = data.eventSystem;
    this.mute(data.isMuted);
    this.changeSpeed(data.speed);
    if (!this.config.playManually) {
      this.start();
    }
  }

  createScene(): void {
    // create scene
    const bg = addBackground(this, "background");
    this.timerText = addText(this, `${GAME_TIME}:00`, {
      bg,
      yAnchor: Anchor.start,
      xAnchor: Anchor.start,
      widthRel: 0.5,
      maxFontSize: 48,
    });
    this.matchText = addText(this, "Catch the fruits!", {
      bg,
      yAnchor: Anchor.end,
      widthRel: 1,
      maxFontSize: 78,
    });
    this.bg = bg;
    this.accuracyText = addText(this, "Accuracy: 100%", {
      bg,
      yAnchor: Anchor.start,
      xAnchor: Anchor.center,
      widthRel: 0.5,
      maxFontSize: 48,
    });
    this.tweens.add({
      targets: bg,
      alpha: { from: 0, to: 1 },
      duration: 1000,
    });
    if (this.config?.playManually) {
      const logo = addImage(this, "logo", undefined, { bg, y: -200 });
      const logo2 = addImage(this, "logo2", undefined, {
        bg,
        y: -200,
      }).setAlpha(0);
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
      logo.setInteractive();
      logo.on(
        "pointerdown",
        () => {
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
                  this.start();
                  logo.destroy();
                  logo2.destroy();
                },
              });
            },
          });
        },
        this
      );
    }
  }

  start() {
    this.sound.play("music", { loop: true });
    if (this.eventSystem) {
      this.eventSystem.on("pause", this.pause, this);
      this.eventSystem.on("mute", this.mute, this);
      this.eventSystem.on("changeSpeed", this.changeSpeed, this);
    }
    if (this.config?.playManually) {
      this.config.simulation = this.config.simulator.play();
      this.input.on("gameobjectdown", this.selectFruit, this);
    }
    this.numCorrect = 0;
    this.fruit = [];
    this.fruitIdx = 0;
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
      callback: this.spawnFruit,
      callbackScope: this,
    });
    const simulation = this.config?.simulation as FruitSimulationOutput;
    scaleText(
      this,
      this.matchText!,
      `Catch the ${simulation?.matchLabel} fruits!`
    );
  }

  update() {
    if (!this.timerEvent) {
      return;
    }
    if (this.timerEvent.getProgress() === 1) {
      scaleText(this, this.timerText!, "00:00");
      return;
    }
    const remaining = this.timerEvent.getRemainingSeconds().toPrecision(4);
    const pos = remaining.indexOf(".");
    const ms = remaining.substr(pos + 1, 2);
    let seconds = remaining.substring(0, pos);
    seconds = Phaser.Utils.String.Pad(seconds, 2, "0", 1);
    scaleText(this, this.timerText!, `${seconds}:${ms}`);
    // remove fruit
    for (const fruit of this.fruit) {
      if (fruit.y >= this.cameras.main.height) {
        fruit.state = "deleted";
        fruit.destroy();
      }
    }
    this.fruit = this.fruit.filter((f) => f.state !== "deleted");
  }

  spawnFruit() {
    if (!this.config || !this.config.simulation || !this.bg) {
      return;
    }
    const simulation = this.config.simulation as FruitSimulationOutput;
    const fruit = simulation.spawns[this.fruitIdx];
    const fruitObj = this.physics.add.sprite(
      this.bg.displayWidth * fruit.xPos,
      0,
      fruit.fruit.name
    );
    fruitObj.setData(simulation.label, fruit.fruit.traits[simulation.label]);
    fruitObj.setData("x", fruit.xPos);
    if (this.config.playManually) {
      fruitObj.setInteractive();
    } else {
      const response = fruit.classifierOutput;
      if (response?.classifierLabel === response?.realLabel) {
        this.numCorrect++;
        const acc = Math.round((this.numCorrect / (this.fruitIdx + 1)) * 100);
        scaleText(this, this.accuracyText!, `Accuracy: ${acc}%`);
      }
      if (response?.classifierLabel === simulation.matchLabel) {
        this.time.addEvent({
          delay: CLASSIFIER_DELAY - response.confidence * CLASSIFIER_DELAY,
          timeScale: this.speed,
          callback: () => this.selectFruit(undefined, fruitObj),
          callbackScope: this,
        });
      }
    }
    this.fruit.push(fruitObj);
    this.fruitIdx++;
  }

  selectFruit(
    _pointer: Phaser.Input.Pointer | undefined,
    fruit: Phaser.GameObjects.Sprite
  ) {
    if (!this?.cameras?.main) return;
    if (
      fruit.state === "deleting" ||
      fruit.state === "deleted" ||
      !this.config ||
      !this.config.simulation
    ) {
      return;
    }
    fruit.state = "deleting";
    const simulation = this.config.simulation as FruitSimulationOutput;
    if (fruit.data.list[simulation.label] === simulation.matchLabel) {
      this.tweens.add({
        targets: fruit,
        scale: 1.4,
        angle: "-=30",
        yoyo: true,
        ease: "sine.inout",
        duration: 200 / this.speed,
        completeDelay: 200 / this.speed,
        onComplete: () => {
          fruit.state = "deleted";
          fruit.destroy();
        },
      });
      this.sound.play("match");
    } else {
      this.tweens.add({
        targets: fruit,
        alpha: 0,
        yoyo: true,
        repeat: 2,
        duration: 250 / this.speed,
        ease: "sine.inout",
        onComplete: () => {
          fruit.state = "deleted";
          fruit.destroy();
        },
      });
    }
  }

  gameOver() {
    this.spawnEvent?.remove();
    this.input.off("gameobjectdown", this.selectFruit, this);
    this.tweens.add({
      targets: [...this.fruit],
      alpha: 0,
      yoyo: true,
      repeat: 2,
      duration: 250 / this.speed,
      ease: "sine.inout",
      onComplete: () => {
        if (this.config?.playManually) {
          this.input.once("pointerdown", () => this.start(), this);
        } else {
          this.eventSystem?.emit("gameOver");
        }
      },
    });
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
    this.physics.config.timeScale = 1 / this.speed;
    this.time.timeScale = this.speed;
  }
}
