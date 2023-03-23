/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { Experiment, Simulation } from "games/simulator";

type Metric = "F1SCORE" | "ACCURACY" | "PRECISION" | "RECALL";

type MetricWeights = Record<Metric, number>;

interface MetricCutoff {
  cutoff: number;
  score: number;
}

const EvaluationMetricCutoffs: Record<Metric, MetricCutoff[]> = {
  F1SCORE: [
    {
      cutoff: 0.55,
      score: 0.5,
    },
    {
      cutoff: 0.6,
      score: 0.6,
    },
    {
      cutoff: 0.75,
      score: 0.85,
    },
    {
      cutoff: 0.8,
      score: 1,
    },
  ],
  ACCURACY: [
    {
      cutoff: 0.55,
      score: 0.5,
    },
    {
      cutoff: 0.6,
      score: 0.6,
    },
    {
      cutoff: 0.75,
      score: 0.85,
    },
    {
      cutoff: 0.8,
      score: 1,
    },
  ],
  PRECISION: [
    {
      cutoff: 0.55,
      score: 0.5,
    },
    {
      cutoff: 0.6,
      score: 0.6,
    },
    {
      cutoff: 0.75,
      score: 0.85,
    },
    {
      cutoff: 0.8,
      score: 1,
    },
  ],
  RECALL: [
    {
      cutoff: 0.55,
      score: 0.5,
    },
    {
      cutoff: 0.6,
      score: 0.6,
    },
    {
      cutoff: 0.75,
      score: 0.85,
    },
    {
      cutoff: 0.8,
      score: 1,
    },
  ],
};

function getHighestWeightedMetric(metricWeights: MetricWeights): Metric {
  // Note: for now just getting the highest weighted metric, this logic will change
  const metricKeys: Metric[] = Object.keys(metricWeights) as Metric[];
  let highestWeightedMetric = metricKeys[0];
  metricKeys.forEach((nextKey, i) => {
    if (i === 0) {
      return;
    }
    if (metricWeights[nextKey] > metricWeights[highestWeightedMetric]) {
      highestWeightedMetric = nextKey;
    }
  });
  return highestWeightedMetric;
}

function getHighestWeightedMetricAndValue(
  curExperiment: Experiment<Simulation>,
  metricWeights: MetricWeights
): [Metric, number] {
  const highestWeightedMetric: Metric = getHighestWeightedMetric(metricWeights);
  let highestWeightedMetricValue = -1;
  switch (highestWeightedMetric) {
    case "F1SCORE":
      highestWeightedMetricValue = curExperiment.summary.averageF1Score;
      break;
    case "ACCURACY":
      highestWeightedMetricValue = curExperiment.summary.averageAccuracy;
      break;
    case "PRECISION":
      highestWeightedMetricValue = curExperiment.summary.averagePrecision;
      break;
    case "RECALL":
      highestWeightedMetricValue = curExperiment.summary.averageRecall;
      break;
  }
  if (highestWeightedMetricValue === -1) {
    throw new Error(
      `Failed to retrieve highest weighted metric from summary: ${highestWeightedMetric}`
    );
  }
  return [highestWeightedMetric, highestWeightedMetricValue];
}

function getMetricCutoffScore(metric: Metric, metricValue: number): number {
  const metricCutoffs = EvaluationMetricCutoffs[metric];
  let score = 0;
  metricCutoffs.forEach((metricCutoff) => {
    if (metricValue >= metricCutoff.cutoff) {
      score = metricCutoff.score;
    }
  });
  return score;
}

function evaluateCafeExperiment(curExperiment: Experiment<Simulation>) {
  let finalScore = 0;

  const evaluationMetricWeights: MetricWeights = {
    F1SCORE: 0.5,
    ACCURACY: 0.5,
    PRECISION: 0.0,
    RECALL: 0.0,
  };
  // Score +0-0.15 for better performance of metrics of interest vs. a baseline (e.g., set an expected performance and std-dev)
  const classifierPerformanceWeight = 0.15;
  const [highestWeightedMetric, highestWeightedMetricValue] =
    getHighestWeightedMetricAndValue(curExperiment, evaluationMetricWeights);
  const classifierPerformanceWeightedScore =
    getMetricCutoffScore(highestWeightedMetric, highestWeightedMetricValue) *
    classifierPerformanceWeight;
  finalScore += classifierPerformanceWeightedScore;

  // Score: +0.5 for code executes and generates any non-zero valid evaluation for metrics that are important
  if (highestWeightedMetricValue > 0) {
    finalScore += 0.5;
  }

  // Score +0-0.35 for % of key elements in code that are contained (patterns of importance: should all be contained hints)
  // TODO: User gets x amount of points for each optimal use
  const { codeInfo } = curExperiment;
  const pointsPerKeyElement = 0.07; // 0.07 * 5 = .35
  codeInfo.classifierModelUsed === "NAIVE_BAYES" &&
    (finalScore += pointsPerKeyElement / 2); //less points for naives bay, not best classifier
  codeInfo.classifierModelUsed === "LOGISTIC_REGRESSION" &&
    (finalScore += pointsPerKeyElement);

  codeInfo.featureExtractionUsed === "COUNT_VECTORIZER" &&
    (finalScore += pointsPerKeyElement / 2); //less points for count vectorizor, not best feature extractor
  codeInfo.featureExtractionUsed === "TFIDF" &&
    (finalScore += pointsPerKeyElement);

  codeInfo.cleansContractions && (finalScore += pointsPerKeyElement);
  codeInfo.removesStopwords && (finalScore += pointsPerKeyElement);
  codeInfo.cleansContractions && (finalScore += pointsPerKeyElement);

  return finalScore;
}

export function evaluteExperiment(experiment: Experiment<Simulation>) {
  if (experiment.gameId === "cafe") {
    return evaluateCafeExperiment(experiment);
  } else {
    return 1;
  }
}
