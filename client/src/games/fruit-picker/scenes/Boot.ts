import Phaser from "phaser";
import { GameConfig } from "..";

export default class Boot extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  create(data: GameConfig) {
    this.scene.start("Preloader", data);
  }
}
