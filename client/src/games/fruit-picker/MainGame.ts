/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import Phaser from "phaser";
import { GameParams } from "..";
import {
  CLASSIFIER_DELAY,
  FruitSimulation,
  GAME_TIME,
  POINTS_CORRECT,
  POINTS_INCORRECT,
  SPAWN_TIME,
} from "./simulator";
import { Fruits } from "./types";

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

export default class MainGame extends Phaser.Scene {
  highscore: number;
  speed: number;
  isPaused: boolean;
  isMuted: boolean;
  score: number;
  numCorrect: number;
  fruit: Phaser.GameObjects.Sprite[];
  fruitIdx: number;

  timerText?: Phaser.GameObjects.Text;
  highscoreText?: Phaser.GameObjects.Text;
  scoreText?: Phaser.GameObjects.Text;
  accuracyText?: Phaser.GameObjects.Text;
  matchText?: Phaser.GameObjects.Text;
  timerEvent?: Phaser.Time.TimerEvent;
  spawnEvent?: Phaser.Time.TimerEvent;

  config?: GameParams<FruitSimulation>;
  eventSystem?: Phaser.Events.EventEmitter;

  constructor() {
    super("MainGame");
    this.highscore = 0;
    this.speed = 1;
    this.isPaused = false;
    this.isMuted = false;
    this.score = 0;
    this.numCorrect = 0;
    this.fruit = [];
    this.fruitIdx = 0;
  }

  preload() {
    this.load.setPath("assets/fruit-picker");
    this.load.image("background", "background.png");
    this.load.image("logo", "logo.png");
    this.load.setPath("assets/fruit-picker/fruit");
    for (const f of Fruits) {
      this.load.image(f.name, `${f.sprite}.png`);
    }
    this.load.setPath("assets/fruit-picker/sounds");
    this.load.audio("music", ["music.ogg", "music.mp3"]);
    this.load.audio("countdown", ["countdown.ogg", "countdown.mp3"]);
    this.load.audio("match", ["match.ogg", "match.mp3"]);
  }

  create(data: GameParams<FruitSimulation>) {
    this.config = data;
    this.eventSystem = data.eventSystem;
    this.mute(data.isMuted);
    this.changeSpeed(data.speed);
    //
    this.add.image(400, 300, "background");
    this.highscore = this.config.playManually
      ? 0
      : this.config.simulator.summary.highScore;
    this.highscoreText = this.add.text(
      60,
      20,
      `High Score: ${this.highscore}`,
      fontStyle
    );
    this.timerText = this.add.text(20, 20, `${GAME_TIME}:00`, fontStyle);
    this.scoreText = this.add.text(600, 20, "Score: 0", fontStyle);
    if (!this.config.playManually) {
      this.accuracyText = this.add.text(680, 20, "Accuracy: 100%", fontStyle);
    }
    this.matchText = this.add.text(350, 550, "Catch the fruits!", fontStyle);
    this.sound.play("music", { loop: true });
    this.eventSystem.on("pause", this.pause, this);
    this.eventSystem.on("mute", this.mute, this);
    this.eventSystem.on("changeSpeed", this.changeSpeed, this);
    this.start();
  }

  start() {
    if (this.config?.playManually) {
      this.config.simulation = this.config.simulator.play();
      this.input.on("gameobjectdown", this.selectFruit, this);
    }
    this.score = 0;
    this.numCorrect = 0;
    this.fruit = [];
    this.fruitIdx = 0;
    this.timerText?.setText(`${GAME_TIME}:00`);
    this.scoreText?.setText("Score: 0");
    this.accuracyText?.setText("Accuracy: 100%");
    this.matchText?.setText(
      `Catch the ${this.config?.simulation?.matchLabel} fruits!`
    );
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
      callback: this.spawnFruit,
      callbackScope: this,
    });
  }

  update() {
    if (!this.timerEvent) {
      return;
    }
    if (this.timerEvent.getProgress() === 1) {
      this.timerText?.setText("00:00");
      return;
    }
    const remaining = this.timerEvent.getRemainingSeconds().toPrecision(4);
    const pos = remaining.indexOf(".");
    const ms = remaining.substr(pos + 1, 2);
    let seconds = remaining.substring(0, pos);
    seconds = Phaser.Utils.String.Pad(seconds, 2, "0", 1);
    this.timerText?.setText(seconds + ":" + ms);
    // remove fruit
    for (const fruit of this.fruit) {
      if (fruit.y >= 600) {
        fruit.state = "deleted";
      }
    }
    this.fruit = this.fruit.filter((f) => f.state !== "deleted");
  }

  spawnFruit() {
    if (!this.config || !this.config.simulation) {
      return;
    }
    const simulation = this.config.simulation;
    const fruit = simulation.spawns[this.fruitIdx];
    const fruitObj = this.physics.add.sprite(fruit.xPos, 0, fruit.fruit.name);
    fruitObj.setData("name", fruit.fruit.name);
    fruitObj.setData("description", fruit.fruit.description);
    fruitObj.setData("idx", this.fruitIdx);
    fruitObj.setData(simulation.label, fruit.fruit.traits[simulation.label]);
    if (this.config.playManually) {
      fruitObj.setInteractive();
    } else {
      const response = fruit.classifierOutput;
      if (response?.classifierLabel === response?.realLabel) {
        this.numCorrect++;
        const acc = Math.round((this.numCorrect / (this.fruitIdx + 1)) * 100);
        this.accuracyText?.setText(`Accuracy: ${acc}%`);
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
    if (
      fruit.state === "deleting" ||
      fruit.state === "deleted" ||
      !this.config ||
      !this.config.simulation
    ) {
      return;
    }
    fruit.state = "deleting";
    if (
      fruit.data.list[this.config.simulation.label] ===
      this.config.simulation.matchLabel
    ) {
      this.score += POINTS_CORRECT;
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
      this.score += POINTS_INCORRECT;
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
    this.scoreText?.setText("Score: " + this.score);
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
    } else {
      this.physics.world.resume();
    }
  }

  changeSpeed(speed: number) {
    this.speed = speed;
    this.physics.config.timeScale = 1 / this.speed;
    this.time.timeScale = this.speed;
  }
}
