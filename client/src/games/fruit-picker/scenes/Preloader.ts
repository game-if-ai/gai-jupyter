import Phaser from "phaser";
import { GameConfig } from "..";
import { Fruits } from "../types";

export default class Preloader extends Phaser.Scene {
  loadText?: Phaser.GameObjects.Text;

  constructor() {
    super("Preloader");
  }

  preload() {
    this.loadText = this.add.text(400, 360, "Loading ...", {
      fontFamily: "Arial",
      fontSize: "64",
      color: "#e3f2ed",
    });
    this.loadText.setOrigin(0.5);
    this.loadText.setStroke("#203c5b", 6);
    this.loadText.setShadow(2, 2, "#2d2d2d", 4, true, false);
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
    if (this.sound.locked) {
      this.loadText?.setText("Click to Start");
      this.input.once("pointerdown", () => {
        if (data.simulation === undefined) {
          this.scene.start("MainMenu", data);
        } else {
          this.scene.start("MainGame", data);
        }
      });
    } else {
      if (data.simulation === undefined) {
        this.scene.start("MainMenu", data);
      } else {
        this.scene.start("MainGame", data);
      }
    }
  }
}
