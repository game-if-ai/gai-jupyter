/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { Classifier } from "../../classifier";
import { ClassifierOutput } from "./classifier";
import { Simulation, Simulator } from "../../simulator";
import { Review, Reviews } from "./types";

export const GAME_TIME = 60; // time the game lasts in seconds
export const SPAWN_TIME = 2000;
export const ITEM_TIME = 5; // time each item stays in seconds
export const CLASSIFIER_DELAY = 450; // delay in ms for classifier at 0 confidence

export interface FoodSpawn {
  // food: string;
  review: Review;
  classifierOutput?: ClassifierOutput;
}

export interface CafeSimulation extends Simulation {
  // score: number;
  // accuracy: number;
  spawns: FoodSpawn[];
}

export class CafeSimulator extends Simulator<CafeSimulation> {
  play() {
    const shuffled = [...Reviews].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 30);
    const spawns: FoodSpawn[] = selected.map((s) => ({
      review: s,
    }));
    return {
      spawns: spawns,
      score: 0,
      accuracy: 0,
    };
  }

  simulate(numRuns: number, classifier: Classifier) {
    super.simulate(numRuns, classifier);
    for (let i = 0; i < numRuns; i++) {
      const sim = this.play();
      for (const spawn of sim.spawns) {
        const classifierOutput = classifier.classify({
          review: spawn.review,
        });
        if (classifierOutput?.classifierLabel === classifierOutput?.realLabel) {
          sim.score++;
          sim.accuracy++;
        } else {
          sim.score--;
        }
        spawn.classifierOutput = classifierOutput;
      }
      sim.accuracy = sim.accuracy / sim.spawns.length;
      this.simulations.push(sim);
    }
    this.updateSummary();
  }
}
