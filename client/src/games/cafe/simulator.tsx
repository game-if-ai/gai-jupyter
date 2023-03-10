/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { Experiment, Simulation, Simulator } from "../simulator";
import { Review, Reviews } from "./types";
import { randomInt } from "../../utils";
import { INotebookState } from "@datalayer/jupyter-react";

export const GAME_TIME = 60; // time the game lasts in seconds
export const SPAWN_TIME = 2000;
export const ITEM_TIME = 5; // time each item stays in seconds
export const CLASSIFIER_DELAY = 2500; // delay in ms for classifier at 0 confidence
export const ITEMS = ["egg", "dumpling", "riceball", "sushi", "flan"];
export const CUSTOMERS = ["brown", "panda", "polar", "redpanda", "pink"];

export interface ClassifierOutput {
  review: Review;
  inputText: string; // review text
  realLabel: number; // what the review's rating was
  classifierLabel: number; // what the classifier thought it was
  confidence: number; // how confident the classifier was (0 to 1)
}

export interface ItemSpawn {
  item: string;
  review: Review;
  classifierOutput?: ClassifierOutput;
}

export interface CafeSimulation extends Simulation {
  // score: number;
  // accuracy: number;
  customer: string;
  spawns: ItemSpawn[];
}

export class CafeSimulator extends Simulator<CafeSimulation> {
  play() {
    const numItemsSpawned = (GAME_TIME * 1000) / SPAWN_TIME;
    const reviews = [...Reviews]
      .sort(() => 0.5 - Math.random())
      .slice(0, numItemsSpawned);
    const spawns: ItemSpawn[] = reviews.map((s) => ({
      item: ITEMS[randomInt(ITEMS.length)],
      review: s,
    }));
    return {
      customer: CUSTOMERS[randomInt(CUSTOMERS.length)],
      spawns: spawns,
      score: 0,
      accuracy: 0,
      precision: 0,
      recall: 0,
      f1Score: 0,
    };
  }

  simulate(
    outputs: ClassifierOutput[][],
    trainInstances: number,
    testInstances: number,
    evaluationCode: string[],
    notebook: INotebookState
  ): Experiment<CafeSimulation> {
    const experiment = super.simulate(
      outputs,
      trainInstances,
      testInstances,
      evaluationCode,
      notebook
    );
    for (let run = 0; run < outputs.length; run++) {
      const sim = this.play();
      const simClassifierOutput = outputs[run];
      for (let i = 0; i < sim.spawns.length; i++) {
        const classifierOutput = simClassifierOutput[i];
        if (classifierOutput.classifierLabel) {
          sim.score += classifierOutput.realLabel ? 1 : -1;
        }
        if (classifierOutput.classifierLabel === classifierOutput.realLabel) {
          sim.accuracy++;
        }
        sim.spawns[i].review = outputs[run][i].review;
        sim.spawns[i].classifierOutput = classifierOutput;
      }
      const numTruePositive = simClassifierOutput.filter(
        (output) => output.classifierLabel === 1 && output.realLabel === 1
      ).length;
      const numFalsePositive = simClassifierOutput.filter(
        (output) => output.classifierLabel === 1 && output.realLabel === 0
      ).length;
      const numFalseNegative = simClassifierOutput.filter(
        (output) => output.classifierLabel === 0 && output.realLabel === 1
      ).length;
      sim.precision = numTruePositive / (numTruePositive + numFalsePositive);
      sim.recall = numTruePositive / (numTruePositive + numFalseNegative);
      sim.f1Score =
        (2 * sim.precision * sim.recall) / (sim.precision + sim.recall);
      sim.accuracy = sim.accuracy / sim.spawns.length;
      experiment.simulations.push(sim);
    }
    experiment.summary = this.updateSummary(
      experiment.simulations,
      experiment.summary
    );
    if (experiment.simulations.length > 0) {
      this.experiments.push(experiment);
    }
    return experiment;
  }
}
