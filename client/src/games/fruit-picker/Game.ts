import Phaser from "phaser";
import { GameConfig } from ".";
import { EventSystem } from "../../event-system";
import {
  CLASSIFIER_DELAY,
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

  score: number;
  accuracy: number;
  fruit: Phaser.GameObjects.Sprite[];
  fruitIdx: number;

  timerText?: Phaser.GameObjects.Text;
  highscoreText?: Phaser.GameObjects.Text;
  scoreText?: Phaser.GameObjects.Text;
  accuracyText?: Phaser.GameObjects.Text;
  matchText?: Phaser.GameObjects.Text;
  timerEvent?: Phaser.Time.TimerEvent;
  spawnEvent?: Phaser.Time.TimerEvent;

  config?: GameConfig;

  constructor() {
    super("MainGame");
    this.highscore = 0;
    this.speed = 1;
    this.isPaused = false;
    this.score = 0;
    this.accuracy = 1;
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
    this.load.audio("music", ["music.ogg", "music.m4a", "music.mp3"]);
    this.load.audio("countdown", [
      "countdown.ogg",
      "countdown.m4a",
      "countdown.mp3",
    ]);
    this.load.audio("match", ["match.ogg", "match.m4a", "match.mp3"]);
  }

  create(data: GameConfig) {
    this.config = data;
    this.add.image(400, 300, "background");
    this.highscore = this.config.playManually ? 0 : this.config.simulator.summary.highScore;
    this.highscoreText = this.add.text(60, 20, `High Score: ${this.highscore}`, fontStyle);
    this.timerText = this.add.text(20, 20, `${GAME_TIME}:00`, fontStyle);
    this.scoreText = this.add.text(550, 20, "Score: 0", fontStyle);
    this.accuracyText = this.add.text(650, 20, "Accuracy: 100%", fontStyle);
    this.matchText = this.add.text(350, 550, "Catch the fruits!", fontStyle);
    EventSystem.on('changeSpeed', this.changeSpeed, this);
    EventSystem.on('pause', this.pause, this);
    this.start();
  }

  start() {
    if (this.config?.playManually) {
      this.config.simulation = this.config.simulator.play();
      this.input.on("gameobjectdown", this.selectFruit, this);
    }
    this.score = 0;
    this.accuracy = 1;
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
    // this.sound.play("countdown", { delay: GAME_TIME - 3 });
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
    const fruit = simulation.spawnedFruits[this.fruitIdx];
    const fruitObj = this.physics.add.sprite(fruit.xPos, 0, fruit.fruit.name);
    fruitObj.setData("name", fruit.fruit.name);
    fruitObj.setData("description", fruit.fruit.description);
    fruitObj.setData("idx", this.fruitIdx);
    fruitObj.setData(simulation.label, fruit.fruit.traits[simulation.label]);
    if (this.config.playManually) {
      fruitObj.setInteractive();
    } else {
      const response = fruit.classifierOutput;
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
    if (fruit.state === "deleting" || fruit.state === "deleted" || !this.config || !this.config.simulation) {
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
        duration: 200,
        completeDelay: 200,
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
        duration: 250,
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
      duration: 250,
      ease: "sine.inout",
      onComplete: () => {
        if (this.config?.playManually) {
          this.input.once(
            "pointerdown",
            () => this.start(),
            this
          );
        } else {
          EventSystem.emit("gameOver")
        }
      },
    });
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
    this.physics.config.timeScale = this.speed;
    this.time.timeScale = this.speed;
  }
}
