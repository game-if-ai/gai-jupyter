import Phaser from "phaser";
import { GameParams } from ".";

export default class MainMenu extends Phaser.Scene {
  constructor() {
    super("MainMenu");
  }

  preload() {
    this.load.setPath("assets/fruit-picker");
    this.load.image("background", "background.png");
    this.load.image("logo", "logo.png");
  }

  create(data: GameParams) {
    let background = this.add.image(400, 300, "background");
    this.tweens.add({
      targets: background,
      alpha: { from: 0, to: 1 },
      duration: 1000,
    });
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
    this.add.text(
      20,
      20,
      "High Score: " + data.simulator.summary.highScore,
      fontStyle
    );
    let logo = this.add.image(400, -200, "logo");
    this.tweens.add({
      targets: logo,
      y: 300,
      ease: "bounce.out",
      duration: 1200,
    });
    this.input.once("pointerdown", () => {
      this.scene.start("MainGame", data);
    });
  }
}