/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { WineCodeInfo } from "./use-with-wine-code-examine";

export interface ClusterGroup {
  numMembers: number;
  quality: number;
}

export function getAllWineCodeInfo(userCode: string[]): WineCodeInfo {
  return {
    dropsWineColumn: dropsWineColumn(userCode),
    dropsWineColumnWithAxis: dropsWineColumnWithAxis(userCode),
    savesQualityColumnBeforeDropping:
      savesQualityColumnBeforeDropping(userCode),
    dropsQualityColumn: dropsQualityColumn(userCode),
    dropsQualityColumnWithAxis: dropsQualityColumnWithAxis(userCode),
    usesStandardScaler: usesStandardScaler(userCode),
    fitsWithStandardScaler: fitsWithStandardScaler(userCode),
    transformsWithStandardScaler: transformsWithStandardScaler(userCode),
    usesDataframe: usesDataframe(userCode),
  };
}

function codeContainsRegex(userCode: string[], regex: RegExp): boolean {
  return Boolean(userCode.find((codeLine) => codeLine.match(regex)));
}

function dropsWineColumn(userCode: string[]): boolean {
  return codeContainsRegex(userCode, /drop.*[",']Wine[",'].*/);
}

function dropsWineColumnWithAxis(userCode: string[]): boolean {
  return codeContainsRegex(userCode, /drop.*[",']Wine[",'].*,.*axis=1.*/);
}

function savesQualityColumnBeforeDropping(userCode: string[]): boolean {
  return codeContainsRegex(
    userCode,
    /.*=.*wineDataFrame\[[",']quality[",']\].*/
  );
}

function dropsQualityColumn(userCode: string[]): boolean {
  return codeContainsRegex(userCode, /drop.*[",']quality[",'].*/);
}

function dropsQualityColumnWithAxis(userCode: string[]): boolean {
  return codeContainsRegex(userCode, /drop.*[",']quality[",'].*,.*axis=1.*/);
}

function usesStandardScaler(userCode: string[]): boolean {
  return codeContainsRegex(userCode, /StandardScaler\(\)/);
}

function fitsWithStandardScaler(userCode: string[]): boolean {
  return codeContainsRegex(userCode, /.fit/);
}

function transformsWithStandardScaler(userCode: string[]): boolean {
  return codeContainsRegex(userCode, /.transform/);
}

function usesDataframe(userCode: string[]): boolean {
  return codeContainsRegex(userCode, /DataFrame\(/);
}

export function processData(data: string): ClusterGroup[] {
  // data example: ,quality,N\n4,5.267857142857143,168\n2,5.326923076923077,520\n3,5.333333333333333,30\n1,5.538181818181818,275\n0,5.915697674418604,344\n5,6.255725190839694,262\n
  const lines = data.split("\n");
  lines.shift(); //Remove first line that constains title
  const groups: ClusterGroup[] = [];
  lines.forEach((line) => {
    if (!line) {
      return;
    }
    groups.push({
      numMembers: parseInt(line.split(",")[2]),
      quality: parseFloat(line.split(",")[1]),
    });
  });
  return groups;
}

/**
 *
 * @param validationCellOutput a string that contains csv stringified data
 */
export function extractWineCellOutput(
  validationCellOutput: any
): ClusterGroup[] {
  return processData(validationCellOutput);
}
