/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

export interface ImageProps {
  x?: number;
  y?: number;
  xRel?: number;
  yRel?: number;
  width?: number;
  height?: number;
  widthScale?: number;
  heightScale?: number;
}

export interface TextProps {
  x?: number;
  y?: number;
  xRel?: number;
  yRel?: number;
  width?: number;
  height?: number;
  fontSize?: number;
  maxWidth?: number;
  maxFontSize?: number;
}

export function addBackgroundImage(
  scene: Phaser.Scene,
  texture: string
): Phaser.GameObjects.Image {
  const image = scene.add.image(0, 0, texture);
  image.state = "background";
  scaleImage(scene, image, texture, undefined, {
    widthScale: 1,
    heightScale: 1,
  });
  return image;
}

export function addImage(
  scene: Phaser.Scene,
  texture: string,
  frame?: string,
  props: ImageProps = {}
): Phaser.GameObjects.Image {
  const image = scene.add.image(0, 0, texture, frame);
  scaleImage(scene, image, texture, frame, props);
  return image;
}

export function addSprite(
  scene: Phaser.Scene,
  texture: string,
  frame?: string,
  props: ImageProps = {}
): Phaser.GameObjects.Sprite {
  const sprite = scene.add.sprite(0, 0, texture, frame);
  scaleImage(scene, sprite, texture, frame, props);
  return sprite;
}

export function scaleImage(
  scene: Phaser.Scene,
  image: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite,
  texture?: string,
  frame?: string,
  props: ImageProps = {}
) {
  const { width: gameWidth, height: gameHeight } = scene.cameras.main;
  props = { ...image.getData("props"), ...props };
  const x = gameWidth * (props.xRel || 0.5);
  const y = gameHeight * (props.yRel || 0.5);
  image.setX(x);
  image.setY(y);
  image.setTexture(texture || image.texture.key);
  if (frame) {
    image.setFrame(frame);
  }
  if (props.width) {
    const scale = props.width / image.width;
    image.setScale(scale).setScrollFactor(0);
  } else if (props.height) {
    const scale = props.height / image.height;
    image.setScale(scale).setScrollFactor(0);
  } else if (
    image.state === "background" ||
    props.widthScale ||
    props.heightScale
  ) {
    const scaleX = (gameWidth * (props.widthScale || 1)) / image.width;
    const scaleY = (gameHeight * (props.heightScale || 1)) / image.height;
    const scale =
      image.state === "background"
        ? Math.max(scaleX, scaleY)
        : Math.min(scaleX, scaleY);
    image.setScale(scale).setScrollFactor(0);
  }
  if (props.xRel) {
    image.setX(image.x - image.displayWidth / 2);
  }
  if (props.x) {
    const xOffset =
      image.x + props.x - (image.displayWidth / 2) * Math.sign(props.x);
    image.setX(xOffset);
  }
  if (props.y) {
    const yOffset =
      image.y + props.y - (image.displayHeight / 2) * Math.sign(props.y);
    image.setY(yOffset);
  }
}

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
  });
  text.setData("props", props);
  scaleText(scene, text, str, props);
  return text;
}

export function scaleText(
  scene: Phaser.Scene,
  text: Phaser.GameObjects.Text,
  str?: string,
  props: TextProps = {}
) {
  const { width: gameWidth, height: gameHeight } = scene.cameras.main;
  props = { ...text.getData("props"), ...props };
  let fontSize = props.fontSize || 16;
  if (text.text !== str) {
    text.setText(str || text.text);
  }
  text.setFontSize(fontSize);
  text.setX(gameWidth * (props.xRel || 0) + (props.x || 0));
  text.setY(gameHeight * (props.yRel || 0) + (props.y || 0));
  if (props.width || props.height) {
    const width = props.width ? gameWidth * props.width : text.width;
    const height = props.height ? gameHeight * props.height : text.height;
    while (text.width < width || text.height < height) {
      text.setFontSize(++fontSize);
      if (props.maxFontSize && fontSize >= props.maxFontSize) {
        break;
      }
    }
    text.setFontSize(--fontSize);
  }
  if (props.maxWidth) {
    text.setWordWrapWidth(props.maxWidth, true);
  }
  if (props.yRel) {
    text.setY(text.y - text.height * props.yRel);
  }
  if (props.xRel) {
    text.setX(text.x - text.width * props.xRel);
  }
}
