/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
/* eslint-disable */

import { INotebookState } from "@datalayer/jupyter-react";
import { ImproveCodeHint } from "hooks/use-with-improve-code";
import { ActivityID, Experiment, SimulationOutput } from "./";
import { useAppDispatch, useAppSelector } from "../";
import { CafeSimulator } from "../../games/cafe/simulator";
import { FruitSimulator } from "../../games/fruit-picker/simulator";
import { NMTSimulator } from "../../games/neural_machine_translation/simulator";
import { PlaneSimulator } from "../../games/planes/simulator";
import { WineSimulator } from "../../games/wine/simulator";
import { storeNotebookExperimentInGql } from "../../utils";
import { initSimulate } from "./helpers";
import { useWithExperimentsStore } from "../../hooks/use-with-experiments-store";
import { updateLocalNotebook } from "../../store/notebook";

// displayedHints can't be stored because they contain functions
// if needed at a later time, remove just the function from the ImproveCodeHint
export function cleanExperimentForStore(experiment: Experiment): Experiment {
  return {
    ...experiment,
    displayedHints: [],
  };
}

export function useWithSimulator() {
  const dispatch = useAppDispatch();
  const activity = useAppSelector((s) => s.state.activity);
  const uniqueUserId = useAppSelector((s) => s.state.uniqueUserId);
  const cafeSimulator = CafeSimulator();
  const fruitSimulator = FruitSimulator();
  const nmtSimulator = NMTSimulator();
  const planeSimulator = PlaneSimulator();
  const wineSimulator = WineSimulator();
  const { addExperiment } = useWithExperimentsStore();
  function play(): SimulationOutput {
    if (!activity) {
      throw new Error("no activity selected");
    }
    switch (activity.id) {
      case ActivityID.cafe:
        return cafeSimulator.play();
      case ActivityID.fruit:
        return fruitSimulator.play();
      case ActivityID.nmt:
        return nmtSimulator.play();
      case ActivityID.planes:
        return planeSimulator.play();
      case ActivityID.wine:
        return wineSimulator.play();
      default:
        return {};
    }
  }

  function simulate(
    inputs: number[],
    outputs: any,
    notebook: INotebookState,
    displayedHints: ImproveCodeHint[]
  ): Experiment {
    if (!activity) {
      throw new Error("no activity selected");
    }
    let experiment = initSimulate(
      inputs,
      notebook,
      activity.id,
      displayedHints
    );
    switch (activity.id) {
      case ActivityID.cafe:
        experiment = cafeSimulator.simulate(
          inputs,
          outputs,
          notebook,
          displayedHints
        );
        break;
      case ActivityID.fruit:
        experiment = fruitSimulator.simulate(
          inputs,
          outputs,
          notebook,
          displayedHints
        );
        break;
      case ActivityID.nmt:
        experiment = nmtSimulator.simulate(
          inputs,
          outputs,
          notebook,
          displayedHints
        );
        break;
      case ActivityID.planes:
        experiment = planeSimulator.simulate(
          inputs,
          outputs,
          notebook,
          displayedHints
        );
        break;
      case ActivityID.wine:
        experiment = wineSimulator.simulate(
          inputs,
          outputs,
          notebook,
          displayedHints
        );
        break;
    }
    addExperiment(experiment);
    dispatch(updateLocalNotebook({ id: activity.id, notebook: undefined }));
    storeNotebookExperimentInGql(experiment, uniqueUserId);
    return experiment;
  }

  return {
    play,
    simulate,
  };
}
