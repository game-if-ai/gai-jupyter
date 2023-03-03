/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { Fruit, Fruits, FruitTrait } from "./types";
import { Experiment, Simulation, Simulator } from "../simulator";
import { randomInt } from "../../utils";

export const GAME_TIME = 30; // time the game lasts in seconds
export const SPAWN_TIME = 300; // time between fruit spawns in ms
export const POINTS_CORRECT = 2; // points given for a correct fruit
export const POINTS_INCORRECT = -1; // points lost for a bad fruit
export const CLASSIFIER_DELAY = 2000; // delay in ms for classifier catch speed at 0 confidence

export interface FruitClassifierInput {
  fruit: Fruit;
  label: FruitTrait;
}

export interface FruitClassifierOutput {
  fruit: Fruit;
  label: string; // trait (color, shape, etc.)
  inputText: string; // description of fruit
  realLabel: string; // what the fruit's trait (color, shape, etc.) was
  classifierLabel: string; // what the classifier thought it was
  confidence: number; // how confident the classifier was (0 to 1)
}

export interface FruitSimulation extends Simulation {
  // score: number;
  // accuracy: number;
  label: FruitTrait;
  matchLabel: string;
  spawns: FruitSpawn[];
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
    const spawns: FruitSpawn[] = [];
    for (let j = 0; j < numFruitSpawned; j++) {
      const fruit = Fruits[randomInt(Fruits.length)];
      const xPos = randomInt(700, 100);
      spawns.push({ fruit, xPos });
    }
    return {
      label,
      matchLabel,
      spawns,
      score: 0,
      accuracy: 0,
      precision: 0,
      recall: 0,
      f1Score: 0,
    };
  }

  simulate(
    outputs: FruitClassifierOutput[][],
    trainInstances: number,
    testInstances: number,
    evaluationCode: string[]
  ): Experiment<FruitSimulation> {
    const experiment = super.simulate(
      outputs,
      trainInstances,
      testInstances,
      evaluationCode
    );
    for (let run = 0; run < outputs.length; run++) {
      const sim = this.play();
      const simClassifierData = outputs[run];
      const fruits = outputs[run].map((o) => o.fruit);
      sim.label = outputs[run][0].label as FruitTrait;
      sim.matchLabel = outputs[run][0].fruit.traits[sim.label];
      for (let i = 0; i < sim.spawns.length; i++) {
        const fruit = fruits[randomInt(fruits.length)];
        const classifierOutput = simClassifierData.find(
          (f) => f.fruit.name === fruit.name
        );
        sim.spawns[i].fruit = fruit;
        sim.spawns[i].classifierOutput = classifierOutput;
        if (classifierOutput?.classifierLabel === sim.matchLabel) {
          sim.score +=
            classifierOutput.realLabel === sim.matchLabel
              ? POINTS_CORRECT
              : POINTS_INCORRECT;
        }
        if (classifierOutput?.classifierLabel === classifierOutput?.realLabel) {
          sim.accuracy++;
        }
      }
      sim.accuracy = sim.accuracy / sim.spawns.length;
      const allPossibleLabels: string[] = Array.from(
        new Set([
          ...simClassifierData.map((output) => output.realLabel),
          ...simClassifierData.map((output) => output.classifierLabel),
        ])
      );
      const labelsConfusionMatrixDict = allPossibleLabels.reduce(
        (acc: Record<string, any>, label: string) => {
          const numTruePositive = simClassifierData.filter(
            (output) =>
              output.classifierLabel === label && output.realLabel === label
          ).length;
          const numTrueNegative = simClassifierData.filter(
            (output) =>
              output.classifierLabel !== label && output.realLabel !== label
          ).length;
          const numFalsePositive = simClassifierData.filter(
            (output) =>
              output.classifierLabel === label && output.realLabel !== label
          ).length;
          const numFalseNegative = simClassifierData.filter(
            (output) =>
              output.classifierLabel !== label && output.realLabel === label
          ).length;
          acc[label] = {
            numTruePositive,
            numTrueNegative,
            numFalsePositive,
            numFalseNegative,
          };
          return acc;
        },
        {} as Record<string, any>
      );
      const sumTruePositives = Object.keys(labelsConfusionMatrixDict).reduce(
        (acc: number, label: string) => {
          return acc + labelsConfusionMatrixDict[label]["numTruePositive"];
        },
        0
      );
      const sumFalsePositives = Object.keys(labelsConfusionMatrixDict).reduce(
        (acc: number, label: string) => {
          return acc + labelsConfusionMatrixDict[label]["numFalsePositive"];
        },
        0
      );
      const sumFalseNegatives = Object.keys(labelsConfusionMatrixDict).reduce(
        (acc: number, label: string) => {
          return acc + labelsConfusionMatrixDict[label]["numFalseNegative"];
        },
        0
      );
      sim.precision = sumTruePositives / (sumTruePositives + sumFalsePositives);
      sim.recall = sumTruePositives / (sumTruePositives + sumFalseNegatives);
      sim.f1Score =
        (2 * sim.precision * sim.recall) / (sim.precision + sim.recall);
      // sim.accuracy = (sumTruePositives + sumTrueNegatives) / (sumTruePositives + sumTrueNegatives + sumFalseNegatives + sumFalsePositives)
      experiment.simulations.push(sim);
    }
    experiment.summary = this.updateSummary(
      experiment.simulations,
      experiment.summary
    );
    this.experiments.push(experiment);
    return experiment;
  }
}
