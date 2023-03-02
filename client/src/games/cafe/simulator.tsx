/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu
The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { INotebookState } from "@datalayer/jupyter-react";
import { INotebookContent, IOutput } from "@jupyterlab/nbformat";

import { GaiCellTypes } from "../../local-constants";
import { Simulation, Simulator } from "../simulator";
import { Review, Reviews } from "./types";
import { randomInt } from "../../utils";

export const GAME_TIME = 60; // time the game lasts in seconds
export const SPAWN_TIME = 2000;
export const ITEM_TIME = 5; // time each item stays in seconds
export const CLASSIFIER_DELAY = 2500; // delay in ms for classifier at 0 confidence
export const ITEMS = ["egg", "dumpling", "riceball", "sushi", "flan"];
export const CUSTOMERS = ["brown", "panda", "polar", "redpanda", "pink"];

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

export interface CafeSimulation extends Simulation {
  // score: number;
  // accuracy: number;
  customer: string;
  spawns: ItemSpawn[];
}

export class CafeSimulator extends Simulator<CafeSimulation> {
  play() {
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
      score: 0,
      accuracy: 0,
    };
  }

  simulate(runs: number, notebook: INotebookState) {
    if (!notebook || !notebook.model || !notebook.adapter) {
      return;
    }
    super.simulate(runs, notebook);
    const sims: CafeSimulation[] = [];
    const inputs: Review[][] = [];
    for (let i = 0; i < runs; i++) {
      const sim = this.play();
      sims.push(sim);
      inputs.push(sim.spawns.map((s) => s.review));
    }
    const source = notebook.model.toJSON() as INotebookContent;
    let outputCell = -1;
    for (let i = 0; i < notebook.model.cells.length; i++) {
      const cell = notebook.model.cells.get(i);
      if (cell.getMetadata("gai_cell_type") === GaiCellTypes.INPUT) {
        source.cells[i].source = `inputs = ${JSON.stringify(inputs)}`;
      }
      if (cell.getMetadata("gai_cell_type") === GaiCellTypes.OUTPUT) {
        outputCell = i;
      }
    }
    notebook.adapter.setNotebookModel(source);
    notebook.model.cells.get(outputCell).stateChanged.connect((changedCell) => {
      const outputs = changedCell.toJSON().outputs as IOutput[];
      if (outputs.length === 0) {
        return;
      }
      const classifierOutputs = JSON.parse(outputs[0].text as string);
      console.log(classifierOutputs);
      for (const [s, sim] of sims.entries()) {
        for (const [i, spawn] of sim.spawns.entries()) {
          const classifierOutput = classifierOutputs[s][i];
          if (
            classifierOutput?.classifierLabel === classifierOutput?.realLabel
          ) {
            sim.score++;
            sim.accuracy++;
          } else {
            sim.score--;
          }
          spawn.classifierOutput = classifierOutput;
        }
        sim.accuracy = sim.accuracy / sim.spawns.length;
        this.simulations.push(sim);
      }
      this.updateSummary();
    });
    notebook.adapter.commands.execute("notebook:run-all");
  }
}
