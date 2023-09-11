/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { Completion } from "@codemirror/autocomplete";

import { INotebookState, newUuid } from "@datalayer/jupyter-react";
import { ICellModel } from "@jupyterlab/cells";
import { IOutput, ICell, INotebookContent } from "@jupyterlab/nbformat";
import { PartialJSONObject } from "@lumino/coreutils";
import Cmi5, { LaunchParameters } from "@xapi/cmi5";
import { GaiCellTypes, UNIQUE_USER_ID_LS } from "./local-constants";
import { UserInputCellsCode } from "./hooks/use-with-notebook";
import { localStorageGet, localStorageStore } from "./local-storage";
import { AllExperimentTypes, GameExperimentTypes } from "games/activity-types";
import { EditorView } from "codemirror";
import { submitNotebookExperimentGQL } from "./api";
import { Activity, ActivityID } from "./games";
import { ImproveCodeHint } from "hooks/use-with-improve-code";

export function waitMs(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

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

export function round(n: number): string {
  return `${Math.round(n * 100)}%`;
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
  return formatCellCode(cellSource);
}

export function formatCellCode(code: string | string[]): string[] {
  return Array.isArray(code)
    ? code.filter(
        (codeLine) => !codeLine.trim().startsWith("#") && codeLine.length > 0
      )
    : code
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

export function extractSetupAndValidationCellOutputs(
  notebook: INotebookState,
  curActivity: Activity
) {
  let setupCellOutput: number[] = [];
  let validationCellOutput: any[] = [];
  if (!notebook.model) {
    return [setupCellOutput, validationCellOutput];
  }
  const notebookCells = notebook.model.cells;
  for (let i = 0; i < notebookCells.length; i++) {
    const curCell = notebookCells.get(i);
    const cellType = curCell.getMetadata("gai_cell_type") as string;
    if (cellType === GaiCellTypes.SETUP) {
      setupCellOutput = extractSetupCellOutput(curCell);
    }
    if (cellType === GaiCellTypes.VALIDATION) {
      validationCellOutput = curActivity.extractValidationCellOutput
        ? curActivity.extractValidationCellOutput(curCell)
        : extractValidationCellOutput(curCell);
    }
  }
  return [setupCellOutput, validationCellOutput];
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

export function splitListOfStringsBy(strings: string[], delimiter: string) {
  return strings.reduce((acc: string[], curString) => {
    return [...acc, ...curString.split(delimiter)];
  }, []);
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

export function getCmiParams(notebookActivityId: string): LaunchParameters {
  const searchParams = new URL(window.location.href).searchParams;
  const activityId = searchParams.get("activityId") || notebookActivityId;
  const actor = searchParams.get("actor") || "{}";
  const endpoint = searchParams.get("endpoint") || "";
  const fetch = searchParams.get("fetch") || "";
  const registration = searchParams.get("registration") || "";

  let launchParams: LaunchParameters = {
    activityId: activityId,
    actor: { objectType: "Agent", name: getUniqueUserId() },
    endpoint: endpoint,
    fetch: fetch,
    registration: registration,
  };
  try {
    launchParams.actor = {
      ...launchParams.actor,
      ...JSON.parse(actor),
    };
  } catch (err) {
    console.error(err);
  }
  if (Cmi5.isCmiAvailable) {
    const cmi5LaunchParams = Cmi5.instance.getLaunchParameters();
    try {
      launchParams = {
        ...launchParams,
        ...{
          endpoint: cmi5LaunchParams.endpoint,
          fetch: cmi5LaunchParams.fetch,
          actor: cmi5LaunchParams.actor,
          registration: cmi5LaunchParams.registration,
          activityId: cmi5LaunchParams.activityId,
        },
      };
    } catch (err) {
      console.error("failed to get cmi5 instance launch parameters");
    }
  }
  return launchParams;
}

export function getUniqueUserId(): string {
  const uniqueIdFromLocalStorage = localStorageGet(UNIQUE_USER_ID_LS);
  const effectiveUniqueId = uniqueIdFromLocalStorage || newUuid();
  localStorageStore(UNIQUE_USER_ID_LS, effectiveUniqueId);
  return effectiveUniqueId;
}

export function extractAllUserInputCode(notebookContent: INotebookContent) {
  const notebookEditableCode: UserInputCellsCode = notebookContent
    ? extractAllNotebookEditableCode(notebookContent)
    : {};
  return Object.values(notebookEditableCode).flat();
}

/**
 * Replaces the entire label with the text of the label
 */
export const apply = (view: EditorView, completion: Completion) => {
  var cursorPos = view.state.selection.main.head;
  var line = view.state.doc.lineAt(cursorPos);
  var cursorStartingPosition = cursorPos;
  var wordStart = cursorPos;
  const lineTextUpToCursor = view.state.doc
    .slice(line.from, cursorStartingPosition)
    .toJSON()
    .toString();
  // Move word start down by 1 until string is not longer a substring of the label
  while (
    wordStart > 0 &&
    completion.label
      .toLowerCase()
      .includes(
        lineTextUpToCursor
          .slice(wordStart - 1, cursorStartingPosition)
          .toLowerCase()
      )
  ) {
    wordStart--;
  }
  var labelStart = line.from + wordStart;
  var labelEnd = cursorPos;

  // Ensure there is a space between the autocomplete and the preceding word
  var docContent = view.state.sliceDoc(0);
  if (labelStart !== line.from && docContent.charAt(labelStart - 1) !== " ") {
    labelStart++;
  }

  var replaceText = completion.label;
  view.dispatch({
    changes: {
      from: labelStart,
      to: labelEnd,
      insert: replaceText,
    },
  });
  return true;
};

export function storeNotebookExperimentInGql(experiment: AllExperimentTypes) {
  const {
    activityId,
    notebookContent: notebookState,
    summary,
    displayedHints,
  } = experiment;
  submitNotebookExperimentGQL({
    cmi5LaunchParameters: getCmiParams(experiment.activityId),
    activityId,
    notebookState: JSON.stringify(notebookState || "{}"),
    summary,
    displayedHints: displayedHints.map((hint) => {
      return {
        message: hint.message,
        conditionDescription: hint.conditionDescription,
      };
    }),
  }).catch((err) => {
    console.error(
      "There was an issue with saving the experiment to graphql",
      err
    );
  });
}

export function hintClickedCmi5(activityId: ActivityID) {
  if (!Cmi5.isCmiAvailable) {
    console.log("cmi5 not available to save hint clicked");
    return;
  }
  Cmi5.instance.sendCmi5AllowedStatement({
    verb: {
      id: `https://gameifai.org/xapi/verb/hintbuttonclicked`,
      display: {
        "en-US": `Hint Button Clicked`,
      },
    },
    object: {
      id: `${activityId}`,
      objectType: "Activity",
    },
  });
}

export function hintDisplayedCmi5(
  hint: ImproveCodeHint,
  activityId: ActivityID
) {
  if (!Cmi5.isCmiAvailable) {
    console.log("cmi5 not available to save hint", `Hint: ${hint.message}`);
    return;
  }
  Cmi5.instance.sendCmi5AllowedStatement({
    verb: {
      id: `https://gameifai.org/xapi/verb/hintdisplayed`,
      display: {
        "en-US": `Hint Displayed`,
      },
    },
    result: {
      extensions: {
        "Hint Message Displayed": hint.message,
        "Hint Condition": hint.conditionDescription,
      },
    },
    object: {
      id: `${activityId}`,
      objectType: "Activity",
    },
  });
}
