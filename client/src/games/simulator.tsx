/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { extractAllNotebookEditableCode } from "../utils";
import { v4 as uuid } from "uuid";
import { INotebookState } from "@datalayer/jupyter-react";
import { INotebookContent } from "@jupyterlab/nbformat";
import { UserInputCellsCode } from "hooks/use-with-notebook";
import { UserCodeInfo } from "hooks/use-with-user-code-examination";
import { getAllUserCodeInfo } from "../examine-code-utils";
import { ActivityID } from "games";

export interface Experiment<SimulationOutput, Summary> {
  id: string;
  time: Date;
  trainInstances: number;
  testInstances: number;
  simulations: SimulationOutput[];
  notebookContent: INotebookContent | undefined;
  codeInfo: UserCodeInfo;
  gameId: ActivityID;
  summary: Summary;
  evaluationScore: number;
}

export abstract class Simulator<SimulationOutput, Summary> {
  experiments: Experiment<SimulationOutput, Summary>[];

  constructor() {
    this.experiments = [];
  }

  abstract play(): SimulationOutput;

  simulate(
    inputs: number[],
    outputs: any[][],
    notebook: INotebookState | undefined,
    gameId: ActivityID
  ): Experiment<SimulationOutput, Summary> {
    const notebookContent = notebook?.model
      ? (notebook.model.toJSON() as INotebookContent)
      : undefined;
    const notebookEditableCode: UserInputCellsCode = notebookContent
      ? extractAllNotebookEditableCode(notebookContent)
      : {};
    const allUserInputCode = Object.values(notebookEditableCode).flat();
    const codeInfo: UserCodeInfo = getAllUserCodeInfo(allUserInputCode);
    const experiment: Experiment<SimulationOutput, Summary> = {
      id: uuid(),
      gameId,
      time: new Date(),
      notebookContent,
      trainInstances: inputs[0],
      testInstances: inputs[1],
      simulations: [],
      codeInfo,
      summary: {} as any,
      evaluationScore: 0,
    };
    return experiment;
  }

  abstract updateSummary(
    simulations: SimulationOutput[],
    summary: Summary
  ): Summary;

  abstract scoreExperiment(
    experiment: Experiment<SimulationOutput, Summary>
  ): number;
}
