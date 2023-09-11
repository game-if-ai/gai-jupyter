/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

export enum Anchor {
  center = "center",
  start = "start",
  end = "end",
}

export interface ImageProps {
  bg?: Phaser.GameObjects.Image; // position and scale relative to this background
  xAnchor?: Anchor; // x anchor of background to align to (center = middle, start = left, end = right)
  yAnchor?: Anchor; // y anchor of background to align to (center = middle, start = top, end = bottom)
  x?: number; // absolute x offset
  y?: number; // absolute y offset
  xRel?: number; // x offset as a % of the background width
  yRel?: number; // y offset as a % of the background height
  width?: number; // absolute height (will scale width to maintain aspect ratio)
  height?: number; // absolute width (will scale height to maintain aspect ratio)
  widthRel?: number; // width as a % of the background width
  heightRel?: number; // height as a % of the background height
}

export interface TextProps {
  bg?: Phaser.GameObjects.Image; // position and scale relative to this background
  xAnchor?: Anchor; // x anchor of background to align to (center = middle, start = left, end = right)
  yAnchor?: Anchor; // y anchor of background to align to (center = middle, start = top, end = bottom)
  x?: number; // absolute x offset
  y?: number; // absolute y offset
  xRel?: number; // x offset as a % of the background width
  yRel?: number; // y offset as a % of the background height
  width?: number; // absolute height (will scale width to maintain aspect ratio)
  height?: number; // absolute width (will scale height to maintain aspect ratio)
  widthRel?: number; // width as a % of the background width
  heightRel?: number; // height as a % of the background height

  textStyle?: Phaser.Types.GameObjects.Text.TextStyle;
  fontSize?: number;
  maxHeight?: number;
  maxFontSize?: number;
}

/** image helpers */

export function addImage(
  scene: Phaser.Scene,
  texture: string,
  frame?: string,
  props: ImageProps = {}
): Phaser.GameObjects.Image {
  const image = scene.add.image(0, 0, texture, frame);
  scaleImage(scene, image, props);
  return image;
}

export function addSprite(
  scene: Phaser.Scene,
  texture: string,
  frame?: string,
  props: ImageProps = {}
): Phaser.GameObjects.Sprite {
  const sprite = scene.add.sprite(0, 0, texture, frame);
  scaleImage(scene, sprite, props);
  return sprite;
}

export function addBackground(
  scene: Phaser.Scene,
  texture: string
): Phaser.GameObjects.Image {
  const { width: gameWidth, height: gameHeight } = scene.cameras.main;
  const image = scene.add.image(0, 0, texture);
  const scaleX = (gameWidth * 1) / image.width;
  const scaleY = (gameHeight * 1) / image.height;
  const scale = Math.min(scaleX, scaleY);
  image.setScale(scale).setScrollFactor(0);
  let x = gameWidth * 0.5;
  let y = gameHeight * 0.5;
  image.setX(x);
  image.setY(y);
  return image;
}

export function scaleImage(
  scene: Phaser.Scene,
  image: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite,
  props: ImageProps = {}
) {
  props = { ...image.getData("prop"), ...props };
  image.setData("props", props);
  let { width: bgWidth, height: bgHeight, x: bgX, y: bgY } = scene.cameras.main;
  if (props.bg) {
    bgWidth = props.bg.displayWidth;
    bgHeight = props.bg.displayHeight;
    bgX = props.bg.x;
    bgY = props.bg.y;
  }

  if (props.width) {
    const scale = props.width / image.width;
    image.setScale(scale).setScrollFactor(0);
  }
  if (props.height) {
    const scale = props.height / image.height;
    image.setScale(scale).setScrollFactor(0);
  }
  if (props.widthRel) {
    const scale = (bgWidth * props.widthRel) / image.width;
    image.setScale(scale).setScrollFactor(0);
  }
  if (props.heightRel) {
    const scale = (bgHeight * props.heightRel) / image.height;
    image.setScale(scale).setScrollFactor(0);
  }

  const anchorX = props.xAnchor || Anchor.center;
  const anchorY = props.yAnchor || Anchor.center;
  const x =
    bgX -
    bgWidth *
      (anchorX === Anchor.center ? 0 : anchorX === Anchor.start ? 0.5 : -0.5) +
    image.displayWidth *
      (anchorX === Anchor.center ? 0 : anchorX === Anchor.start ? 0.5 : -0.5) +
    (props.x || 0) +
    bgWidth * (props.xRel || 0);
  const y =
    bgY -
    bgHeight *
      (anchorY === Anchor.center ? 0 : anchorY === Anchor.start ? 0.5 : -0.5) +
    image.displayHeight *
      (anchorY === Anchor.center ? 0 : anchorY === Anchor.start ? 0.5 : -0.5) +
    (props.y || 0) +
    bgHeight * (props.yRel || 0);
  image.setX(x);
  image.setY(y);
  image.setOrigin(0.5, 0.5);
}

/** text helpers */

export function addText(
  scene: Phaser.Scene,
  str: string,
  props: TextProps = {}
): Phaser.GameObjects.Text {
  const text = scene.add.text(0, 0, str, {
    fontFamily: "Arial",
    color: "#ffffff",
    fontStyle: "bold",
    shadow: {
      color: "#000000",
      fill: true,
      offsetX: 2,
      offsetY: 2,
      blur: 4,
    },
    ...props.textStyle,
  });
  scaleText(scene, text, str, props);
  return text;
}

export function scaleText(
  scene: Phaser.Scene,
  text: Phaser.GameObjects.Text,
  str?: string,
  props: TextProps = {}
) {
  props = { ...text.getData("props"), ...props };
  text.setData("props", props);
  let { width: bgWidth, height: bgHeight, x: bgX, y: bgY } = scene.cameras.main;
  if (props.bg) {
    bgWidth = props.bg.displayWidth;
    bgHeight = props.bg.displayHeight;
    bgX = props.bg.x;
    bgY = props.bg.y;
  }

  if (text.text !== str) {
    text.setText(str || text.text);
  }
  let fontSize = props.fontSize || 16;
  text.setFontSize(fontSize);

  if (props.width || props.widthRel) {
    const textWidth = props.width || bgWidth * props.widthRel!;
    text.setWordWrapWidth(0, false);
    while (text.width < textWidth) {
      text.setFontSize(++fontSize);
      if (props.maxFontSize && fontSize >= props.maxFontSize) {
        break;
      }
    }
    text.setFontSize(--fontSize);
    text.setWordWrapWidth(textWidth, true);
  }
  if (props.height || props.heightRel) {
    const textHeight = props.height || bgHeight * props.heightRel!;
    while (text.displayHeight < textHeight) {
      text.setFontSize(++fontSize);
      if (props.maxFontSize && fontSize >= props.maxFontSize) {
        break;
      }
    }
    text.setFontSize(--fontSize);
  }
  while (props.maxHeight && text.displayHeight > props.maxHeight) {
    text.setText(`${text.text.substring(0, text.text.length - 5)}...`);
  }

  const anchorX = props.xAnchor || Anchor.center;
  const anchorY = props.yAnchor || Anchor.center;
  const x =
    bgX -
    bgWidth *
      (anchorX === Anchor.center ? 0 : anchorX === Anchor.start ? 0.5 : -0.5) +
    text.displayWidth *
      (anchorX === Anchor.center ? 0 : anchorX === Anchor.start ? 0.5 : -0.5) +
    (props.x || 0) +
    bgWidth * (props.xRel || 0);
  const y =
    bgY -
    bgHeight *
      (anchorY === Anchor.center ? 0 : anchorY === Anchor.start ? 0.5 : -0.5) +
    text.displayHeight *
      (anchorY === Anchor.center ? 0 : anchorY === Anchor.start ? 0.5 : -0.5) +
    (props.y || 0) +
    bgHeight * (props.yRel || 0);
  text.setX(x);
  text.setY(y);
  text.setOrigin(0.5, 0.5);
}
