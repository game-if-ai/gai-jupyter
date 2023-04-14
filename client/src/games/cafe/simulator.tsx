/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { Experiment, Simulator } from "../simulator";
import { Review, Reviews } from "./types";
import {
  average,
  extractAllUserInputCode,
  randomInt,
  storeNotebookExperimentInGql,
} from "../../utils";
import { INotebookState } from "@datalayer/jupyter-react";
import { ActivityID } from "games";
import { getAllCafeCodeInfo } from "./hooks/examine-cafe-code-helpers";
import { CafeCodeInfo } from "./hooks/use-with-cafe-code-examine";
import { evaluateCafeExperiment } from "./hooks/cafe-score-evaluation";
import { ImproveCodeHint } from "hooks/use-with-improve-code";

export const GAME_TIME = 60; // time the game lasts in seconds
export const SPAWN_TIME = 2000;
export const ITEM_TIME = 5; // time each item stays in seconds
export const CLASSIFIER_DELAY = 2500; // delay in ms for classifier at 0 confidence
export const ITEMS = ["egg", "dumpling", "riceball", "sushi", "flan"];
export const CUSTOMERS = ["brown", "panda", "polar", "redpanda", "pink"];
export type CafeExperiment = Experiment<
  CafeSimulationOutput,
  CafeSimulationsSummary,
  CafeCodeInfo
>;

export interface CafeSimulationOutput {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  customer: string;
  spawns: ItemSpawn[];
}

export interface CafeSimulationsSummary {
  lowAccuracy: number;
  highAccuracy: number;
  averageAccuracy: number;
  averagePrecision: number;
  averageRecall: number;
  averageF1Score: number;
  lowF1Score: number;
  highF1Score: number;
}

export interface ClassifierOutput {
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

export class CafeSimulator extends Simulator<
  CafeSimulationOutput,
  CafeSimulationsSummary,
  CafeCodeInfo
> {
  scoreExperiment(experiment: CafeExperiment): number {
    return evaluateCafeExperiment(experiment);
  }

  play(): CafeSimulationOutput {
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
      accuracy: 0,
      precision: 0,
      recall: 0,
      f1Score: 0,
    };
  }

  updateSummary(
    simulations: CafeSimulationOutput[],
    summary: CafeSimulationsSummary
  ): CafeSimulationsSummary {
    const accuracies = simulations.map((s) => s.accuracy);
    const precisions = simulations.map((s) => s.precision);
    const recalls = simulations.map((s) => s.recall);
    const f1Scores = simulations.map((s) => s.f1Score);
    summary.lowAccuracy = Math.min(...accuracies);
    summary.highAccuracy = Math.max(...accuracies);
    summary.averageAccuracy = average(accuracies);
    summary.averagePrecision = average(precisions);
    summary.averageRecall = average(recalls);
    summary.averageF1Score = average(f1Scores);
    summary.lowF1Score = Math.min(...f1Scores);
    summary.highF1Score = Math.max(...f1Scores);
    return summary;
  }

  simulate(
    inputs: number[],
    outputs: ClassifierOutput[][],
    notebook: INotebookState,
    activityId: ActivityID,
    displayedHints: ImproveCodeHint[]
  ): CafeExperiment {
    const experiment = super.simulate(
      inputs,
      outputs,
      notebook,
      activityId,
      displayedHints
    );

    if (experiment.notebookContent) {
      const codeInfo: CafeCodeInfo = getAllCafeCodeInfo(
        extractAllUserInputCode(experiment.notebookContent)
      );
      experiment.codeInfo = codeInfo;
    }
    for (let run = 0; run < outputs.length; run++) {
      const sim = this.play();
      const simClassifierOutput = outputs[run];
      for (let i = 0; i < sim.spawns.length; i++) {
        const classifierOutput = simClassifierOutput[i];
        if (classifierOutput.classifierLabel === classifierOutput.realLabel) {
          sim.accuracy++;
        }
        sim.spawns[i].review = {
          review: classifierOutput.inputText,
          rating: classifierOutput.realLabel,
        };
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
    experiment.evaluationScore = this.scoreExperiment(experiment);

    if (experiment.simulations.length > 0) {
      this.experiments.push(experiment);
    }

    storeNotebookExperimentInGql(experiment);
    return experiment;
  }
}
