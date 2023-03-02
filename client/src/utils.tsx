/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { ICellModel } from "@jupyterlab/cells";
import { IOutput } from "@jupyterlab/nbformat";
import { PartialJSONObject } from "@lumino/coreutils";

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

export function extractClassifierOutputFromCell<T>(cell: ICellModel): T[][] {
  const cellData = cell.toJSON();

  const cellOutput = (cellData.outputs as IOutput[])[0] as IOutput;
  const fruitClassifierData: T[][] =
    (cellOutput?.data &&
      ((cellOutput?.data as PartialJSONObject)["application/json"] as any)) ||
    [];
  return fruitClassifierData;
}
