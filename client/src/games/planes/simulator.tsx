/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { INotebookState } from "@datalayer/jupyter-react";
import { average, extractAllUserInputCode, randomInt } from "../../utils";
import { getAllPlaneCodeInfo } from "./hooks/examine-plane-code-helpers";
import { PlaneCodeInfo } from "./hooks/use-with-plane-code-examine";
import { evaluatePlaneExperiment } from "./hooks/plane-score-evaluation";
import { ImproveCodeHint } from "hooks/use-with-improve-code";
import {
  ActivityID,
  Experiment,
  GameSimulationsSummary,
  Simulator,
} from "../../store/simulator";
import { initSimulate } from "../../store/simulator/helpers";

export const GAME_TIME = 60; // time the game lasts in seconds
export const SPAWN_TIME = 1000;
export const CLASSIFIER_DELAY = 1000; // delay in ms for classifier catch speed at 0 confidence

export type VehicleType = "car" | "plane" | "tank";
export const VehicleTypes: VehicleType[] = ["car", "plane", "tank"];

export interface PlaneSimulationOutput {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  spawns: Spawn[];
}

export interface PlaneSimulationsSummary extends GameSimulationsSummary {}

export interface ClassifierOutput {
  realLabel: VehicleType; // what is actually was
  classifierLabel: VehicleType; // what the classifier thought it was
  confidence: number; // how confident the classifier was (0 to 1)
}

export interface Spawn {
  type: VehicleType;
  xPos: number;
  classifierOutput?: ClassifierOutput;
}

export function PlaneSimulator(): Simulator {
  function scoreExperiment(experiment: Experiment): number {
    return evaluatePlaneExperiment(experiment);
  }

  function updateSummary(
    simulations: PlaneSimulationOutput[],
    summary: PlaneSimulationsSummary
  ): PlaneSimulationsSummary {
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

  function play(): PlaneSimulationOutput {
    const numItemsSpawned = (GAME_TIME * 1000) / SPAWN_TIME;
    const spawns: Spawn[] = [];
    for (let i = 0; i < numItemsSpawned; i++) {
      spawns.push({
        type: VehicleTypes[randomInt(VehicleTypes.length)],
        xPos: Math.random(),
      });
    }
    return {
      spawns: spawns,
      accuracy: 0,
      precision: 0,
      recall: 0,
      f1Score: 0,
    };
  }

  function simulate(
    inputs: number[],
    outputs: ClassifierOutput[][],
    notebook: INotebookState,
    displayedHints: ImproveCodeHint[]
  ): Experiment {
    const experiment = initSimulate(
      inputs,
      notebook,
      ActivityID.planes,
      displayedHints
    );
    if (experiment.notebookContent) {
      const codeInfo: PlaneCodeInfo = getAllPlaneCodeInfo(
        extractAllUserInputCode(experiment.notebookContent)
      );
      experiment.codeInfo = codeInfo;
    }
    for (let run = 0; run < outputs.length; run++) {
      const classifierOutputs = outputs[run];
      const sim: PlaneSimulationOutput = {
        spawns: [],
        accuracy: 0,
        precision: 0,
        recall: 0,
        f1Score: 0,
      };
      const numItemsSpawned = (GAME_TIME * 1000) / SPAWN_TIME;
      for (let i = 0; i < numItemsSpawned; i++) {
        const classifierOutput = classifierOutputs[i];
        if (classifierOutput.classifierLabel === classifierOutput.realLabel) {
          sim.accuracy++;
        }
        const spawn = {
          type: classifierOutput.realLabel,
          xPos: Math.random(),
          classifierOutput,
        };
        sim.spawns.push(spawn);
      }
      sim.accuracy = sim.accuracy / sim.spawns.length;

      const allPossibleLabels: string[] = Array.from(
        new Set([
          ...classifierOutputs.map((output) => output.realLabel),
          ...classifierOutputs.map((output) => output.classifierLabel),
        ])
      );
      const labelsConfusionMatrixDict = allPossibleLabels.reduce(
        (acc: Record<string, any>, label: string) => {
          const numTruePositive = classifierOutputs.filter(
            (output) =>
              output.classifierLabel === label && output.realLabel === label
          ).length;
          const numTrueNegative = classifierOutputs.filter(
            (output) =>
              output.classifierLabel !== label && output.realLabel !== label
          ).length;
          const numFalsePositive = classifierOutputs.filter(
            (output) =>
              output.classifierLabel === label && output.realLabel !== label
          ).length;
          const numFalseNegative = classifierOutputs.filter(
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

      experiment.simulations.push(sim);
    }
    experiment.summary = updateSummary(
      experiment.simulations as PlaneSimulationOutput[],
      experiment.summary as PlaneSimulationsSummary
    );
    experiment.evaluationScore = scoreExperiment(experiment);
    return experiment;
  }

  return {
    play,
    simulate,
  };
}
