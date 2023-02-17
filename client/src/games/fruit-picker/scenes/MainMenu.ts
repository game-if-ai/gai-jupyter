import Phaser from "phaser";
import { GameConfig } from "..";

export default class MainMenu extends Phaser.Scene {
  music: boolean;

  constructor() {
    super("MainMenu");
    this.music = false;
  }

  create(data: GameConfig) {
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
    if (!this.music) {
      this.music = this.sound.play("music", { loop: true });
    }
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
