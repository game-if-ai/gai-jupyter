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
}

export const Fruits: Fruit[] = [
  {
    name: "apple",
    sprite: "apple",
    description: "A round, red apple",
    traits: {
      fruit: "apple",
      color: "red",
    },
  },
  {
    name: "cherry",
    sprite: "cherry",
    description: "A bunch of red cherries",
    traits: {
      fruit: "cherry",
      color: "red",
    },
  },
  {
    name: "coconut",
    sprite: "coconut",
    description: "A round, green coconut",
    traits: {
      fruit: "coconut",
      color: "green",
    },
  },
  {
    name: "grape",
    sprite: "grape",
    description: "A bunch of purple grapes",
    traits: {
      fruit: "grape",
      color: "purple",
    },
  },
  {
    name: "lime",
    sprite: "lemon",
    description: "An oblong, green lime",
    traits: {
      fruit: "lemon",
      color: "green",
    },
  },
  {
    name: "lemon",
    sprite: "lemon2",
    description: "An oblong, yellow lemon",
    traits: {
      fruit: "lemon",
      color: "yellow",
    },
  },
  {
    name: "lychee",
    sprite: "lychee",
    description: "A bunch of yellow lychee",
    traits: {
      fruit: "lychee",
      color: "yellow",
    },
  },
  {
    name: "orange",
    sprite: "orange",
    description: "A round, orange orange",
    traits: {
      fruit: "orange",
      color: "orange",
    },
  },
  {
    name: "peach",
    sprite: "peach",
    description: "An round, pink peach",
    traits: {
      fruit: "peach",
      color: "pink",
    },
  },
  {
    name: "pear",
    sprite: "pear",
    description: "An oblong, green pear",
    traits: {
      fruit: "pear",
      color: "green",
    },
  },
];
