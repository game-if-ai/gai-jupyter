/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { average, extractAllNotebookEditableCode } from "../utils";
import { v4 as uuid } from "uuid";
import { INotebookState } from "@datalayer/jupyter-react";
import { INotebookContent } from "@jupyterlab/nbformat";
import { UserInputCellsCode } from "hooks/use-with-notebook";
import { UserCodeInfo } from "hooks/use-with-user-code-examination";
import { getAllUserCodeInfo } from "../examine-code-utils";
import { ActivityID } from "games";

export interface Experiment<S extends Simulation> {
  id: string;
  time: Date;
  trainInstances: number;
  testInstances: number;
  simulations: S[];
  summary: SimulationSummary;
  notebookContent: INotebookContent | undefined;
  codeInfo: UserCodeInfo;
  gameId: ActivityID;
}

export interface Simulation {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
}

export interface SimulationSummary {
  lowAccuracy: number;
  highAccuracy: number;
  averageAccuracy: number;
  averagePrecision: number;
  averageRecall: number;
  averageF1Score: number;
  lowF1Score: number;
  highF1Score: number;
}

export class Simulator<S extends Simulation> {
  experiments: Experiment<S>[];

  constructor() {
    this.experiments = [];
  }

  play(): S {
    const o: any = {};
    o.accuracy = 0;
    return o;
  }

  simulate(
    inputs: number[],
    outputs: any[][],
    notebook: INotebookState | undefined,
    gameId: ActivityID
  ): Experiment<S> {
    const notebookContent = notebook?.model
      ? (notebook.model.toJSON() as INotebookContent)
      : undefined;
    const notebookEditableCode: UserInputCellsCode = notebookContent
      ? extractAllNotebookEditableCode(notebookContent)
      : {};
    const allUserInputCode = Object.values(notebookEditableCode).flat();
    const codeInfo: UserCodeInfo = getAllUserCodeInfo(allUserInputCode);
    const experiment: Experiment<S> = {
      id: uuid(),
      gameId,
      time: new Date(),
      notebookContent,
      trainInstances: inputs[0],
      testInstances: inputs[1],
      simulations: [],
      codeInfo,
      summary: {
        lowAccuracy: 0,
        highAccuracy: 0,
        averageAccuracy: 0,
        averagePrecision: 0,
        averageRecall: 0,
        averageF1Score: 0,
        lowF1Score: 0,
        highF1Score: 0,
      },
    };
    return experiment;
  }

  protected updateSummary(
    simulations: S[],
    summary: SimulationSummary
  ): SimulationSummary {
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
}
