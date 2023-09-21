/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { Activity, Experiment } from "store/simulator";
import { setActivity, setExperiment, setSimulation, setStep, STEP } from ".";
import { useAppDispatch, useAppSelector } from "../";

interface UseWithState {
  toStep: (step: number) => void;
  toNotebook: () => void;
  loadActivity: (activity: Activity) => void;
  loadSimulation: (simulation: number) => void;
  loadExperiment: (experiment: Experiment) => void;
}

export function useWithState(): UseWithState {
  const dispatch = useAppDispatch();
  const experiments = useAppSelector((s) => s.simulator.experiments);

  function loadActivity(activity: Activity) {
    dispatch(setActivity(activity));
    const aExperiments = experiments[activity.id];
    if (aExperiments.length > 0) {
      dispatch(setExperiment(aExperiments[aExperiments.length - 1]));
    }
    dispatch(setStep(STEP.NOTEBOOK));
  }

  function loadSimulation(simulation: number) {
    dispatch(setSimulation(simulation));
    dispatch(setStep(STEP.SIMULATION));
  }

  function loadExperiment(experiment: Experiment) {
    dispatch(setExperiment(experiment));
  }

  function toStep(step: STEP) {
    dispatch(setStep(step));
  }

  function toNotebook() {
    dispatch(setStep(STEP.NOTEBOOK));
  }

  return {
    toStep,
    toNotebook,
    loadActivity,
    loadSimulation,
    loadExperiment,
  };
}
