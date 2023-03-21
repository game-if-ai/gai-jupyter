import { Experiment, Simulation } from "games/simulator";

type Metric = "F1SCORE" | "ACCURACY" | "PRECISION" | "RECALL"

type MetricWeights = Record<Metric, number>;

interface MetricCutoff{
    cutoff: number;
    score: number;
}

const EvaluationMetricCutoffs: Record<Metric, MetricCutoff[]> = {
    "F1SCORE" : [
        {
            cutoff: 0.55,
            score: 0.5
        },
        {
            cutoff: 0.6,
            score: 0.6
        },
        {
            cutoff: 0.75,
            score: 0.85
        },
        {
            cutoff: 0.8,
            score: 1
        },
    ],
    "ACCURACY" : [
        {
            cutoff: 0.55,
            score: 0.5
        },
        {
            cutoff: 0.6,
            score: 0.6
        },
        {
            cutoff: 0.75,
            score: 0.85
        },
        {
            cutoff: 0.8,
            score: 1
        },
    ],
    "PRECISION" : [
        {
            cutoff: 0.55,
            score: 0.5
        },
        {
            cutoff: 0.6,
            score: 0.6
        },
        {
            cutoff: 0.75,
            score: 0.85
        },
        {
            cutoff: 0.8,
            score: 1
        },
    ],
    "RECALL" : [
        {
            cutoff: 0.55,
            score: 0.5
        },
        {
            cutoff: 0.6,
            score: 0.6
        },
        {
            cutoff: 0.75,
            score: 0.85
        },
        {
            cutoff: 0.8,
            score: 1
        },
    ],
}

function getHighestWeightedMetric(metricWeights: MetricWeights): Metric{
    // Note: for now just getting the highest weighted metric, this logic will change
    const metricKeys: Metric[] = Object.keys(metricWeights) as Metric[];
    let highestWeightedMetric = metricKeys[0];
    metricKeys.forEach((nextKey,i)=>{
        if(i === 0){
            return;
        }
        if (metricWeights[nextKey] > metricWeights[highestWeightedMetric]){
            highestWeightedMetric = nextKey;
        }
    });
    return highestWeightedMetric;
}

function getHighestWeightedMetricAndValue(curExperiment: Experiment<Simulation>, metricWeights: MetricWeights): [Metric, number]{
    const highestWeightedMetric: Metric = getHighestWeightedMetric(metricWeights);
    let highestWeightedMetricValue = -1;
    switch(highestWeightedMetric){
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
    if(highestWeightedMetricValue === -1){
        throw new Error(`Failed to retrieve highest weighted metric from summary: ${highestWeightedMetric}`);
    }
    return [highestWeightedMetric, highestWeightedMetricValue];
}

function getMetricCutoffScore(metric: Metric, metricValue: number): number{
    const metricCutoffs = EvaluationMetricCutoffs[metric];
    let score = 0;
    metricCutoffs.forEach((metricCutoff)=>{
        if (metricValue >= metricCutoff.cutoff){
            score = metricCutoff.score;
        }
    });
    return score;
}

export function evaluteExperiment(curExperiment: Experiment<Simulation>){
    const evaluationMetricWeights: MetricWeights = {
        "F1SCORE": .5,
        "ACCURACY" : .5,
        "PRECISION": .0,
        "RECALL": .0
    };
    const [highestWeightedMetric, highestWeightedMetricValue] = getHighestWeightedMetricAndValue(curExperiment, evaluationMetricWeights);
    const metricFinalScore = getMetricCutoffScore(highestWeightedMetric, highestWeightedMetricValue);
    return metricFinalScore;
}