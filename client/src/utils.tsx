/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { INotebookState } from "@datalayer/jupyter-react";
import { ICellModel } from "@jupyterlab/cells";
import { IOutput, ICell, INotebookContent } from "@jupyterlab/nbformat";
import { PartialJSONObject } from "@lumino/coreutils";
import { LaunchParameters } from "@xapi/cmi5";
import { GaiCellTypes } from "./local-constants";
import { UserInputCellsCode } from "./hooks/use-with-notebook";
import { GameExperimentTypes } from "games/activity-types";

export function copyAndSet<T>(a: T[], i: number, item: T): T[] {
  return [...a.slice(0, i), item, ...a.slice(i + 1)];
}

export function copyAndRemove<T>(a: T[], i: number): T[] {
  return [...a.slice(0, i), ...a.slice(i + 1)];
}

export function copyAndMove<T>(a: T[], moveFrom: number, moveTo: number): T[] {
  const item = a[moveFrom];
  const removed = copyAndRemove(a, moveFrom);
  return [...removed.slice(0, moveTo), item, ...removed.slice(moveTo)];
}

export function random(max: number, min: number = 0): number {
  return Math.random() * (max - min) + min;
}

export function randomInt(max: number, min: number = 0): number {
  return Math.floor(random(max, min));
}

export function average(arr: number[]) {
  const total = arr.reduce((acc, c) => acc + c, 0);
  return total / arr.length;
}

export function capitalizeFirst(word: string): string {
  return word.charAt(0).toUpperCase() + word.toLowerCase().slice(1);
}

export function extractClassifierOutputFromCell<T>(cell: ICellModel): T[][] {
  const cellData = cell.toJSON();

  const cellOutput = (cellData.outputs as IOutput[])[0] as IOutput;
  const fruitClassifierData: T[][] =
    (cellOutput?.data &&
      ((cellOutput?.data as PartialJSONObject)["application/json"] as any)) ||
    [];
  return fruitClassifierData;
}

export function formatDateTime(now: Date) {
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // Get the current month (0-11), add 1 to convert to 1-12 format
  const day = now.getDate();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const dateTimeString = `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
  return dateTimeString;
}

export function extractNotebookCellCode(notebook: INotebookState): string[][] {
  if (!notebook || !notebook.model || !notebook.adapter) {
    return [];
  }
  let cellSources: string[][] = [];
  for (let i = 0; i < notebook.model.cells.length; i++) {
    const cell = notebook.model.cells.get(i);
    const cellSource = cell.toJSON().source;
    if (typeof cellSource == "string") {
      cellSources.push([cellSource]);
    } else {
      cellSources.push(cellSource);
    }
  }
  return cellSources;
}

export function extractAllNotebookEditableCode(
  notebookContent: INotebookContent
): UserInputCellsCode {
  const notebookCells = notebookContent.cells;
  let evalCellCount = 0;
  let inputCellsCode: UserInputCellsCode = {};
  for (let i = 0; i < notebookCells.length; i++) {
    const cell = notebookCells[i];
    const cellSource = extractCellCode(cell);
    const cellType = cell.metadata["gai_cell_type"];
    if (cellType === GaiCellTypes.MODEL) {
      inputCellsCode = {
        ...inputCellsCode,
        [`MODEL-CELL-${evalCellCount}`]: cellSource,
      };
      evalCellCount++;
    }
  }
  return inputCellsCode;
}

export function extractCellCode(cell: ICellModel | ICell): string[] {
  const cellData =
    typeof cell.toJSON === "function"
      ? (cell as ICellModel).toJSON()
      : (cell as ICell);
  const cellSource = cellData.source;
  return Array.isArray(cellSource)
    ? cellSource.filter(
        (codeLine) => !codeLine.trim().startsWith("#") && codeLine.length > 0
      )
    : cellSource
        .split("\n")
        .filter(
          (codeLine) => !codeLine.trim().startsWith("#") && codeLine.length > 0
        );
}

export function extractSetupCellOutput(cell: ICellModel): number[] {
  const cellData = cell.toJSON();
  const outputs = cellData.outputs as IOutput[];
  if (!outputs || outputs.length === 0) {
    return [0, 0];
  }
  const cellOutput = outputs[outputs.length - 1] as IOutput;
  const data = (cellOutput?.data &&
    ((cellOutput?.data as PartialJSONObject)["application/json"] as any)) || [
    0, 0,
  ];
  return data;
}

export function extractValidationCellOutput<T>(cell: ICellModel): T[][] {
  const cellData = cell.toJSON();
  const cellOutput = (cellData.outputs as IOutput[])[0] as IOutput;
  const data: T[][] =
    (cellOutput?.data &&
      ((cellOutput?.data as PartialJSONObject)["application/json"] as any)) ||
    [];
  return data;
}

function f1ScoreComparison(a: GameExperimentTypes, b: GameExperimentTypes) {
  if (a.summary.averageF1Score < b.summary.averageF1Score) {
    return -1;
  }
  if (a.summary.averageF1Score > b.summary.averageF1Score) {
    return 1;
  }
  return 0;
}

export function sortExperimentsByF1Score(experiments: GameExperimentTypes[]) {
  return experiments.slice().sort(f1ScoreComparison);
}

export function getCmiParamsFromUri(): LaunchParameters {
  const searchParams = new URL(window.location.href).searchParams;
  const activityId = searchParams.get("activityId") || "";
  const actor = searchParams.get("actor") || "";
  const endpoint = searchParams.get("endpoint") || "";
  const fetch = searchParams.get("fetch") || "";
  const registration = searchParams.get("registration") || "";
  return {
    activityId: activityId,
    actor: JSON.parse(actor),
    endpoint: endpoint,
    fetch: fetch,
    registration: registration,
  };
}

export function round(n: number): string {
  return `${Math.round(n * 100)}%`;
}
