/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
/* eslint-disable */

import { useIndexedDBStore } from "use-indexeddb";
import { useEffect, useState } from "react";
import {
  Experiment,
  ExperimentHistory,
  updateExperimentHistory,
  initialState,
  ActivityID,
} from "../store/simulator";
import { useAppDispatch, useAppSelector } from "../store";

// displayedHints can't be stored because they contain functions
export function cleanExperimentForStore(experiment: Experiment): Experiment {
  return {
    ...experiment,
    displayedHints: [],
  };
}

export function useWithExperimentsStore() {
  const { add, getAll, deleteByID, getManyByKey } =
    useIndexedDBStore<Experiment>("experiment-history");
  const pastExperiments = useAppSelector((s) => s.simulator.experiments);
  const dispatch = useAppDispatch();
  useEffect(() => {
    getExperimentHistoryFromStore().then((experimentHistory) => {
      dispatch(updateExperimentHistory({ experimentHistory }));
    });
  }, []);

  async function getExperimentHistoryFromStore(): Promise<ExperimentHistory> {
    const experimentHistory = await getAll();
    return experimentHistory.reduce((acc, experiment) => {
      if (!acc[experiment.activityId]) {
        acc[experiment.activityId] = [];
      }
      acc[experiment.activityId].push(experiment);
      return acc;
    }, {} as ExperimentHistory);
  }

  function addExperiment(experiment: Experiment) {
    add(cleanExperimentForStore(experiment)).then(() => {
      getExperimentHistoryFromStore().then((experimentHistory) => {
        dispatch(updateExperimentHistory({ experimentHistory }));
      });
    });
  }

  async function clearExperimentHistory(activityId: ActivityID) {
    const experiments = await getManyByKey("activityId", activityId);
    experiments.forEach((experiment) => {
      deleteByID(experiment.id);
    });
    getExperimentHistoryFromStore().then((experimentHistory) => {
      experimentHistory[activityId] = [];
      dispatch(updateExperimentHistory({ experimentHistory }));
    });
  }

  function getPastExperiments(activityId: ActivityID): Experiment[] {
    return pastExperiments[activityId] || [];
  }

  return {
    addExperiment,
    getPastExperiments,
    clearExperimentHistory,
  };
}
