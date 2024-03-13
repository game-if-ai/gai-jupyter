/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { INotebookState } from "@datalayer/jupyter-react";
import { ImproveCodeHint } from "hooks/use-with-improve-code";
import { ActivityID, Experiment } from ".";
import { v4 as uuid } from "uuid";
import { INotebookContent } from "@jupyterlab/nbformat";

export function initSimulate(
  inputs: number[],
  notebook: INotebookState,
  activityId: ActivityID,
  displayedHints: ImproveCodeHint[]
): Experiment {
  const notebookContent = notebook.model
    ? (notebook.model.toJSON() as INotebookContent)
    : undefined;
  const experiment: Experiment = {
    id: uuid(),
    activityId,
    time: new Date(),
    notebookContent,
    trainInstances: inputs[0],
    testInstances: inputs[1],
    simulations: [],
    displayedHints: displayedHints,
    codeInfo: {} as any,
    summary: {} as any,
    evaluationScore: 0,
  };
  return experiment;
}
