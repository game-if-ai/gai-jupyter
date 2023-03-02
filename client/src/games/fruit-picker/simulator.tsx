/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { INotebookState } from "@datalayer/jupyter-react";
import { INotebookContent } from "@jupyterlab/nbformat";

import { Fruit, Fruits, FruitTrait } from "./types";
import { GaiCellTypes } from "../../local-constants";
import { Simulation, Simulator } from "../simulator";
import { extractClassifierOutputFromCell, randomInt } from "../../utils";

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
  inputText: string; // description of fruit
  label: string; // trait (color, shape, etc.)
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

  simulate(runs: number, notebook: INotebookState) {
    if (!notebook || !notebook.model || !notebook.adapter) {
      return;
    }
    super.simulate(runs, notebook);
    const sims: FruitSimulation[] = [];
    const inputs: FruitClassifierInput[][] = [];
    for (let i = 0; i < runs; i++) {
      const sim = this.play();
      sims.push(sim);
      inputs.push(
        sim.spawns.map((s) => ({ fruit: s.fruit, label: sim.label }))
      );
    }
    const source = notebook.model.toJSON() as INotebookContent;
    let outputCell = -1;
    for (let i = 0; i < notebook.model.cells.length; i++) {
      const cell = notebook.model.cells.get(i);
      if (cell.getMetadata("gai_cell_type") === GaiCellTypes.INPUT) {
        source.cells[i].source = `inputs = ${JSON.stringify(inputs)}`;
      }
      if (cell.getMetadata("gai_cell_type") === GaiCellTypes.OUTPUT) {
        outputCell = i;
      }
    }
    notebook.adapter.setNotebookModel(source);
    notebook.model.cells.get(outputCell).stateChanged.connect((changedCell) => {
      const classifierOutputs =
        extractClassifierOutputFromCell<FruitClassifierOutput>(changedCell);
      if (classifierOutputs.length === 0) {
        return;
      }
      for (const [s, sim] of sims.entries()) {
        const simClassifierData: FruitClassifierOutput[] = classifierOutputs[s];
        for (const [i, spawn] of sim.spawns.entries()) {
          const classifierOutput = classifierOutputs[s][i];
          if (classifierOutput?.classifierLabel === sim.matchLabel) {
            sim.score +=
              spawn.fruit.traits[sim.label] === sim.matchLabel
                ? POINTS_CORRECT
                : POINTS_INCORRECT;
          }
          if (
            classifierOutput?.classifierLabel === classifierOutput?.realLabel
          ) {
            sim.accuracy++;
          }
          spawn.classifierOutput = classifierOutput;
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
        sim.precision =
          sumTruePositives / (sumTruePositives + sumFalsePositives);
        sim.recall = sumTruePositives / (sumTruePositives + sumFalseNegatives);
        sim.f1Score =
          (2 * sim.precision * sim.recall) / (sim.precision + sim.recall);
        // sim.accuracy = (sumTruePositives + sumTrueNegatives) / (sumTruePositives + sumTrueNegatives + sumFalseNegatives + sumFalsePositives)
        this.simulations.push(sim);
      }
      this.updateSummary();
    });
    notebook.adapter.commands.execute("notebook:run-all");
  }
}
