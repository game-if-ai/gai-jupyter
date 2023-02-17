import Phaser from "phaser";
import { GameConfig } from "..";
import {
  FruitSpawn,
  GAME_TIME,
  POINTS_CORRECT,
  POINTS_INCORRECT,
  SPAWN_TIME,
} from "../simulator";

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
  score: number;
  label: string;
  matchLabel: string;
  spawnedFruit: FruitSpawn[];

  fruit: Phaser.GameObjects.Sprite[];
  fruitIdx: number;

  timerText?: Phaser.GameObjects.Text;
  scoreText?: Phaser.GameObjects.Text;
  accuracyText?: Phaser.GameObjects.Text;
  matchText?: Phaser.GameObjects.Text;
  timerEvent?: Phaser.Time.TimerEvent;
  spawnEvent?: Phaser.Time.TimerEvent;

  playManually: boolean;
  config?: GameConfig;

  constructor() {
    super("MainGame");
    this.score = 0;
    this.label = "";
    this.matchLabel = "";
    this.spawnedFruit = [];

    this.fruit = [];
    this.fruitIdx = 0;
    this.playManually = true;
  }

  create(data: GameConfig) {
    this.config = data;
    this.add.image(400, 300, "background");
    this.timerText = this.add.text(20, 20, `${GAME_TIME}:00`, fontStyle);
    this.scoreText = this.add.text(530, 20, "Score: 0", fontStyle);
    this.accuracyText = this.add.text(530, 60, "Accuracy: 0%", fontStyle);
    this.matchText = this.add.text(350, 20, "Catch the fruits!", fontStyle);
    this.playManually = this.config.simulation === undefined;
    if (this.playManually) {
      this.config.simulation = this.config.simulator.play();
      this.input.on("gameobjectdown", this.selectFruit, this);
    }
    this.start();
  }

  start() {
    this.score = 0;
    this.matchText?.setText(
      `Catch the ${this.config!.simulation!.matchLabel} fruits!`
    );
    this.timerEvent = this.time.addEvent({
      delay: GAME_TIME * 1000,
      callback: this.gameOver,
      callbackScope: this,
    });
    this.spawnEvent = this.time.addEvent({
      delay: SPAWN_TIME,
      loop: true,
      callback: this.spawnFruit,
      callbackScope: this,
    });
    this.sound.play("countdown", { delay: GAME_TIME - 3 });
  }

  update() {
    if (!this.timerEvent) {
      return;
    }
    if (this.timerEvent.getProgress() === 1) {
      this.timerText?.setText("00:00");
      return;
    }
    const elapsedTime = this.timerEvent.getElapsedSeconds();
    const remaining = (GAME_TIME - elapsedTime).toPrecision(4);
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
    const simulation = this.config!.simulation!;
    const fruit = simulation.spawnedFruits[this.fruitIdx];
    const fruitObj = this.physics.add.sprite(fruit.xPos, 0, fruit.fruit.name);
    fruitObj.setData("name", fruit.fruit.name);
    fruitObj.setData("description", fruit.fruit.description);
    fruitObj.setData("idx", this.fruitIdx);
    fruitObj.setData(simulation.label, fruit.fruit.traits[simulation.label]);
    if (this.playManually) {
      fruitObj.setInteractive();
    } else {
      const response = fruit.classifierOutput;
      if (response?.classifierLabel === simulation.matchLabel) {
        this.time.addEvent({
          delay: 3000 - response.confidence * 3000,
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
    if (fruit.state === "deleting" || fruit.state === "deleted") {
      return;
    }
    fruit.state = "deleting";
    if (
      fruit.data.list[this.config!.simulation!.label] ===
      this.config!.simulation!.matchLabel
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
        if (this.playManually) {
          this.input.once(
            "pointerdown",
            () => {
              this.scene.start("MainMenu", {
                simulator: this.config!.simulator,
                simulation: undefined,
              });
            },
            this
          );
        }
      },
    });
  }
}
