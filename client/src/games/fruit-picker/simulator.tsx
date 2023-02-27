/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { Fruit, Fruits, FruitTrait } from "./types";
import { Classifier } from "../../classifier";
import { FruitClassifierOutput } from "./classifier";
import { Simulation, Simulator } from "../../simulator";
import { randomInt } from "../../utils";

export const GAME_TIME = 30; // time the game lasts in seconds
export const SPAWN_TIME = 300; // time between fruit spawns in ms
export const POINTS_CORRECT = 2; // points given for a correct fruit
export const POINTS_INCORRECT = -1; // points lost for a bad fruit
export const CLASSIFIER_DELAY = 2000; // delay in ms for classifier catch speed at 0 confidence

export interface FruitSimulation extends Simulation {
  // score: number;
  // accuracy: number;
  label: FruitTrait;
  matchLabel: string;
  spawnedFruits: FruitSpawn[];
}

export interface FruitSpawn {
  fruit: Fruit;
  xPos: number;
  classifierOutput?: FruitClassifierOutput;
}

export class FruitSimulator extends Simulator<FruitSimulation> {
  play() {
    const traits = Object.values(FruitTrait);
    const numFruitSpawned = Math.floor((GAME_TIME * 1000) / SPAWN_TIME);
    const label = traits[randomInt(traits.length)];
    const matchLabel = Fruits[randomInt(Fruits.length)].traits[label];
    const spawnedFruits: FruitSpawn[] = [];
    for (let j = 0; j < numFruitSpawned; j++) {
      const fruit = Fruits[randomInt(Fruits.length)];
      const xPos = randomInt(700, 100);
      spawnedFruits.push({ fruit, xPos });
    }
    return {
      label,
      matchLabel,
      spawnedFruits,
      score: 0,
      accuracy: 0,
    };
  }

  simulate(numRuns: number, classifier: Classifier) {
    super.simulate(numRuns, classifier);
    for (let i = 0; i < numRuns; i++) {
      const sim = this.play();
      for (const spawn of sim.spawnedFruits) {
        const classifierOutput = classifier.classify({
          fruit: spawn.fruit,
          label: sim.label,
        });
        if (classifierOutput?.classifierLabel === sim.matchLabel) {
          sim.score +=
            spawn.fruit.traits[sim.label] === sim.matchLabel
              ? POINTS_CORRECT
              : POINTS_INCORRECT;
        }
        if (classifierOutput?.classifierLabel === classifierOutput?.realLabel) {
          sim.accuracy++;
        }
        spawn.classifierOutput = classifierOutput;
      }
      sim.accuracy = sim.accuracy / sim.spawnedFruits.length;
      this.simulations.push(sim);
    }
    this.updateSummary();
  }
}
