/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import Phaser from "phaser";
import {
  addBackground,
  addImage,
  addSprite,
  addText,
  Anchor,
} from "../phaser-helpers";
import { randomInt } from "../../utils";
import { SPAWN_TIME } from "./simulator";
import { GameParams } from "games";
import { VehicleTypes } from "./types";

export interface Bin {
  bin: Phaser.GameObjects.Sprite;
  text: Phaser.GameObjects.Text;
  items: Phaser.GameObjects.Sprite[];
}

export default class MainMenu extends Phaser.Scene {
  bins: Record<string, Bin>;

  constructor() {
    super("MainMenu");
    this.bins = {};
  }

  preload() {
    this.load.setPath("assets");
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
    // add background
    const bg = addBackground(this, "background");
    bg.setY(0 + bg.displayHeight / 2);
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
    const text = addText(this, "Cars, Planes, or Trains?", {
      bg,
      widthRel: 0.9,
      maxFontSize: 78,
    });
    text.setX(this.cameras.main.displayWidth / 2);
    text.setY(this.cameras.main.displayHeight / 2);

    // add events
    this.input.on(
      "drag",
      function (
        pointer: any,
        item: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
        dragX: number,
        dragY: number
      ) {
        item.x = dragX;
        item.y = dragY;
      }
    );
    const ref = this;
    this.input.on(
      "drop",
      function (
        _pointer: any,
        item: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
        bin: { name: string }
      ) {
        ref.drag(item, bin.name);
      }
    );
    this.time.addEvent({
      delay: SPAWN_TIME,
      startAt: SPAWN_TIME,
      loop: true,
      callback: this.spawn,
      callbackScope: this,
    });
  }

  spawn() {
    const type = VehicleTypes[randomInt(VehicleTypes.length - 1)];
    const object = this.physics.add.sprite(
      randomInt(5, this.cameras.main.displayWidth - 5),
      -50,
      `${type}${randomInt(10) + 1}`
    );
    object.setDisplaySize(50, 50);
    object.setInteractive();
    object.name = type;
    this.input.setDraggable(object);
  }

  drag(item: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, bin: string) {
    // if the gameObject and zone match
    if (item.name === bin) {
      this.sound.play("match");
    } else {
      this.sound.play("wrong");
    }
    item.body.moves = false;
    item.disableInteractive();
    this.input.setDraggable(item, false);
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
}
