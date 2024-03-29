/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

export interface Fruit {
  name: string;
  sprite: string;
  description: string;
  traits: Record<FruitTrait, string>;
}

export enum FruitTrait {
  fruit = "fruit",
  color = "color",
  shape = "shape",
}

export const Fruits: Fruit[] = [
  {
    name: "apple",
    sprite: "apple",
    description: "A round and red apple.",
    traits: {
      fruit: "apple",
      color: "red",
      shape: "round",
    },
  },
  {
    name: "perfect apple",
    sprite: "apple2",
    description:
      "A crisp and delicious, round and red apple. Very juicy and sweet.",
    traits: {
      fruit: "apple",
      color: "red",
      shape: "round",
    },
  },
  {
    name: "cherry",
    sprite: "cherry",
    description: "A pair of red cherries.",
    traits: {
      fruit: "cherry",
      color: "red",
      shape: "bunched",
    },
  },
  {
    name: "perfect cherry",
    sprite: "cherry2",
    description: "A pair of sweet, fresh and red cherries.",
    traits: {
      fruit: "cherry",
      color: "red",
      shape: "bunched",
    },
  },
  {
    name: "coconut",
    sprite: "coconut",
    description: "A young coconut. Round and green.",
    traits: {
      fruit: "coconut",
      color: "green",
      shape: "round",
    },
  },
  {
    name: "grape",
    sprite: "grape",
    description: "A bunched of purple grapes. A little sour.",
    traits: {
      fruit: "grape",
      color: "purple",
      shape: "bunched",
    },
  },
  {
    name: "perfect grape",
    sprite: "grape2",
    description: "A bunched of red grapes. Perfectly sweet.",
    traits: {
      fruit: "grape",
      color: "red",
      shape: "bunched",
    },
  },
  {
    name: "lemon",
    sprite: "lemon",
    description:
      "An oblong, green lemon. A little ripe so it looks like a lime. Very sour.",
    traits: {
      fruit: "lemon",
      color: "green",
      shape: "oblong",
    },
  },
  {
    name: "perfect lemon",
    sprite: "lemon2",
    description: "An oblong, yellow lemon. Would make some great lemonade.",
    traits: {
      fruit: "lemon",
      color: "green",
      shape: "oblong",
    },
  },
  {
    name: "lychee",
    sprite: "lychee",
    description: "A bunched of lychee. A little too ripe, so they're yellow",
    traits: {
      fruit: "lychee",
      color: "yellow",
      shape: "bunched",
    },
  },
  {
    name: "perfect lychee",
    sprite: "lychee2",
    description: "A bunched of lychee. Sweet, fresh, and red.",
    traits: {
      fruit: "lychee",
      color: "red",
      shape: "bunched",
    },
  },
  {
    name: "orange",
    sprite: "orange",
    description: "A round orange. Very orange.",
    traits: {
      fruit: "orange",
      color: "orange",
      shape: "round",
    },
  },
  {
    name: "perfect orange",
    sprite: "orange2",
    description:
      "An oblong and orange orange. Larger and sweeter than normal oranges.",
    traits: {
      fruit: "orange",
      color: "orange",
      shape: "oblong",
    },
  },
  {
    name: "peach",
    sprite: "peach",
    description: "A sweet, round, peach. Very pink.",
    traits: {
      fruit: "peach",
      color: "pink",
      shape: "round",
    },
  },
  {
    name: "perfect peach",
    sprite: "peach2",
    description: "A sweet, round, peach. This peach is gold for some reason!",
    traits: {
      fruit: "peach",
      color: "yellow",
      shape: "round",
    },
  },
  {
    name: "pear",
    sprite: "pear",
    description: "An oblong, green pear.",
    traits: {
      fruit: "pear",
      color: "green",
      shape: "oblong",
    },
  },
  {
    name: "perfect pear",
    sprite: "pear2",
    description: "An perfect golden pear. Smells great and tastes great too.",
    traits: {
      fruit: "pear",
      color: "yellow",
      shape: "oblong",
    },
  },
];
