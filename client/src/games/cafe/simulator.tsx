/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { INotebookState } from "@datalayer/jupyter-react";
import { INotebookContent, IOutput } from "@jupyterlab/nbformat";

import { GaiCellTypes } from "../../local-constants";
import { ClassifierOutput, Simulation, Simulator } from "../simulator";
import { Review, Reviews } from "./types";
import { randomInt } from "../../utils";

export const GAME_TIME = 60; // time the game lasts in seconds
export const SPAWN_TIME = 2000;
export const ITEM_TIME = 5; // time each item stays in seconds
export const CLASSIFIER_DELAY = 4000; // delay in ms for classifier at 0 confidence
export const ITEMS = ["egg", "dumpling", "riceball", "sushi", "flan"];
export const CUSTOMERS = ["brown", "panda", "polar", "redpanda", "pink"];

export interface CafeClassifierOutput extends ClassifierOutput {
  inputText: string; // review text
  realLabel: number; // what the review's rating was
  classifierLabel: number; // what the classifier thought it was
  confidence: number; // how confident the classifier was (0 to 1)
}

export interface FoodSpawn {
  item: string;
  review: Review;
  classifierOutput?: CafeClassifierOutput;
}

export interface CafeSimulation extends Simulation {
  // score: number;
  // accuracy: number;
  customer: string;
  spawns: FoodSpawn[];
}

export class CafeSimulator extends Simulator<CafeSimulation> {
  play() {
    const numItemsSpawned = (GAME_TIME * 1000) / SPAWN_TIME;
    const reviews = [...Reviews]
      .sort(() => 0.5 - Math.random())
      .slice(0, numItemsSpawned);
    const spawns: FoodSpawn[] = reviews.map((s) => ({
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

  simulate(runs: number, notebook: INotebookState, cb: () => void) {
    if (!notebook || !notebook.model || !notebook.adapter) {
      return;
    }
    super.simulate(runs, notebook, cb);
    const source = notebook.model.toJSON() as INotebookContent;
    for (let i = 0; i < runs; i++) {
      const sim = this.play();
      let codeCell = -1;
      for (let c = 0; c < notebook.model.cells.length; c++) {
        const cellModel = notebook.model.cells.get(c);
        if (cellModel.getMetadata("gai_cell_type") === GaiCellTypes.INPUT) {
          const reviews = sim.spawns.map((s) => s.review);
          source.cells[c].source = source.cells[c].source.concat(
            `\ninput = ${JSON.stringify(reviews)}`
          );
        }
        if (
          cellModel.getMetadata("gai_cell_type") === GaiCellTypes.EVALUATION
        ) {
          source.cells[c].source = cellModel.toJSON().source;
          codeCell = c;
        }
      }
      notebook.adapter.setNotebookModel(source);
      notebook.model.cells.get(codeCell).stateChanged.connect((changedCell) => {
        const outputs = changedCell.toJSON().outputs as IOutput[];
        if (outputs.length === 0) {
          return;
        }
        const classifierOutputs = JSON.parse(outputs[0].text as string);
        for (const [s, spawn] of sim.spawns.entries()) {
          const classifierOutput = classifierOutputs[s];
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
        this.updateSummary();
        cb();
      });
      notebook.adapter.commands.execute("notebook:run-all");
    }
  }
}
