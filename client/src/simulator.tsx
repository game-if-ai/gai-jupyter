/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { Classifier } from "./classifier";
import { average } from "./utils";

export interface Simulation {
  score: number;
  accuracy: number;
}

export interface SimulationSummary {
  numRuns: number;
  lowScore: number;
  highScore: number;
  averageScore: number;
  lowAccuracy: number;
  highAccuracy: number;
  averageAccuracy: number;
}

export class Simulator<S extends Simulation> {
  simulations: S[];
  summary: SimulationSummary;

  constructor() {
    this.simulations = [];
    this.summary = {
      numRuns: 0,
      lowScore: 0,
      highScore: 0,
      averageScore: 0,
      lowAccuracy: 0,
      highAccuracy: 0,
      averageAccuracy: 0,
    };
  }

  play(): S {
    const o: any = {};
    o.score = 0;
    o.accuracy = 0;
    return o;
  }

  simulate(runs: number, classifier: Classifier) {
    this.summary.numRuns += runs;
  }

  protected updateSummary() {
    const scores = this.simulations.map((s) => s.score);
    const accuracies = this.simulations.map((s) => s.accuracy);
    this.summary.lowScore = Math.min(...scores);
    this.summary.highScore = Math.max(...scores);
    this.summary.averageScore = average(scores);
    this.summary.lowAccuracy = Math.min(...accuracies);
    this.summary.highAccuracy = Math.max(...accuracies);
    this.summary.averageAccuracy = average(accuracies);
  }
}
