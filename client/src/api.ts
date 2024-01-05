/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import axios from "axios";
import { LaunchParameters } from "@xapi/cmi5";
import { NMTSimulationsSummary } from "games/neural_machine_translation/simulator";
import {
  ActivityID,
  GameSimulationsSummary,
  SimulationSummary,
} from "./store/simulator";

const GRAPHQL_ENDPOINT = process.env.REACT_APP_GRAPHQL_ENDPOINT;

const CODE_EXECUTOR_ENDPOINT = process.env.REACT_APP_CODE_EXECUTOR_ENDPOINT;
const REQUEST_EXECUTION_ENPOINT = `${CODE_EXECUTOR_ENDPOINT}/execute`;
export const SUCCESS_STATUS = "SUCCESS";
export const FAILURE_STATUS = "FAILURE";

export interface CodeExecutorResponse {
  id: string;
  status: string;
  state: string;
  result?: string;
  console?: string;
  statusUrl: string;
  error?: string;
  message?: string;
}

interface DisplayedHint {
  message: string;
  conditionDescription: string;
}

interface SubmitNotebookExperimentGQL {
  cmi5LaunchParameters: LaunchParameters;
  activityId: ActivityID;
  notebookState: string;
  summary: SimulationSummary;
  displayedHints: DisplayedHint[];
}

interface GraphQLResponse<T> {
  errors?: { message: string }[];
  data?: T;
}

const planeNotebookMutation = `
mutation submitPlaneNotebookExperiment(
  $cmi5LaunchParameters: Cmi5LaunchParametersType,
  $activityId: String,
  $notebookStateStringified: String
  $summary: PlaneSummaryInputType
  $displayedHints: [DisplayedHintsInputType]
){
  submitPlaneNotebookExperiment(
    cmi5LaunchParameters: $cmi5LaunchParameters,
    activityId: $activityId,
    notebookStateStringified: $notebookStateStringified,
    summary: $summary,
    displayedHints: $displayedHints
  )
}
`;

const nmtNotebookMutation = `
mutation submitNmtNotebookExperiment(
  $cmi5LaunchParameters: Cmi5LaunchParametersType,
  $activityId: String,
  $notebookStateStringified: String
  $summary: NMTSummaryInputType
  $displayedHints: [DisplayedHintsInputType]
){
  submitNmtNotebookExperiment(
    cmi5LaunchParameters: $cmi5LaunchParameters,
    activityId: $activityId,
    notebookStateStringified: $notebookStateStringified,
    summary: $summary,
    displayedHints: $displayedHints
  )
}
`;

const cafeNotebookMutation = `
mutation submitCafeNotebookExperiment(
  $cmi5LaunchParameters: Cmi5LaunchParametersType,
  $activityId: String,
  $notebookStateStringified: String,
  $summary: CafeSummaryInputType,
  $displayedHints: [DisplayedHintsInputType]
){
  submitCafeNotebookExperiment(
    cmi5LaunchParameters: $cmi5LaunchParameters,
    activityId: $activityId,
    notebookStateStringified: $notebookStateStringified,
    summary: $summary,
    displayedHints: $displayedHints
  )
}`;

const fruitPickerMutation = `
mutation submitFruitPickerNotebookExperiment(
  $cmi5LaunchParameters: Cmi5LaunchParametersType,
  $activityId: String,
  $notebookStateStringified: String,
  $summary: FruitPickerSummaryInputType,
  $displayedHints: [DisplayedHintsInputType]
){
  submitFruitPickerNotebookExperiment(
    cmi5LaunchParameters: $cmi5LaunchParameters,
    activityId: $activityId,
    notebookStateStringified: $notebookStateStringified,
    summary: $summary,
    displayedHints: $displayedHints
  )
}
`;

function extractNotebookSummaryGQL(
  data: SubmitNotebookExperimentGQL
): SimulationSummary {
  if (!(data.activityId in ActivityID)) {
    throw new Error("Activity types summary not handled for sending to GQL");
  } else if (data.activityId === ActivityID.nmt) {
    const dataSummary = data.summary as NMTSimulationsSummary;
    return {
      callsFitOnTexts: dataSummary.callsFitOnTexts,
      callsTextsToSequences: dataSummary.callsTextsToSequences,
      callsPadSequences: dataSummary.callsPadSequences,
      callsPadSequencesWithPaddingPost:
        dataSummary.callsPadSequencesWithPaddingPost,
      callsPadSequencesTwice: dataSummary.callsPadSequencesTwice,
      callsPadSequencesTwiceWithPaddingPost:
        dataSummary.callsPadSequencesTwiceWithPaddingPost,
      callsReshape: dataSummary.callsReshape,
      callsReshapeOnXAndY: dataSummary.callsReshapeOnXAndY,
      callsArgmax: dataSummary.callsArgmax,
      callsJoin: dataSummary.callsJoin,
      hasValidationOutput: dataSummary.hasValidationOutput,
      dataIsNumpyArray: dataSummary.dataIsNumpyArray,
      keywordZeroLookup: dataSummary.keywordZeroLookup,
      preprocessedDataCorrectDimensions:
        dataSummary.preprocessedDataCorrectDimensions,
      outputCorrectlyFormatted: dataSummary.outputCorrectlyFormatted,
    };
  } else {
    const dataSummary = data.summary as GameSimulationsSummary;
    return {
      lowAccuracy: dataSummary.lowAccuracy,
      highAccuracy: dataSummary.highAccuracy,
      averageAccuracy: dataSummary.averageAccuracy,
      averagePrecision: dataSummary.averagePrecision,
      averageRecall: dataSummary.averageRecall,
      averageF1Score: dataSummary.averageF1Score,
      lowF1Score: dataSummary.lowF1Score,
      highF1Score: dataSummary.highF1Score,
    };
  }
}

export async function submitNotebookExperimentGQL(
  data: SubmitNotebookExperimentGQL
): Promise<boolean> {
  if (!GRAPHQL_ENDPOINT) {
    return false;
  }
  let mutationQuery;
  switch (data.activityId) {
    case ActivityID.cafe:
      mutationQuery = cafeNotebookMutation;
      break;
    case ActivityID.fruit:
      mutationQuery = fruitPickerMutation;
      break;
    case ActivityID.nmt:
      mutationQuery = nmtNotebookMutation;
      break;
    case ActivityID.planes:
      mutationQuery = planeNotebookMutation;
      break;
    default:
      throw new Error(
        "this notebook activity is not supported yet, add it to this function"
      );
  }
  const gqlRes = await axios.post<GraphQLResponse<boolean>>(GRAPHQL_ENDPOINT, {
    query: mutationQuery,
    variables: {
      cmi5LaunchParameters: data.cmi5LaunchParameters,
      activityId: data.activityId,
      notebookStateStringified: data.notebookState,
      summary: extractNotebookSummaryGQL(data),
      displayedHints: data.displayedHints,
    },
  });
  if (gqlRes.status !== 200) {
    throw new Error(
      `submit notebook experiment gql failed: ${gqlRes.statusText}}`
    );
  }
  if (gqlRes.data.errors) {
    throw new Error(
      `errors reponse to submit notebook mutation: ${JSON.stringify(
        gqlRes.data.errors
      )}`
    );
  }
  if (gqlRes.data.data === undefined) {
    throw new Error(
      `no data in non-error reponse: ${JSON.stringify(gqlRes.data)}`
    );
  }
  return gqlRes.data.data;
}

export async function requestCodeExecution(
  code: string,
  lesson: ActivityID
): Promise<CodeExecutorResponse> {
  const reqBody = { code: code, lesson: lesson.toString() };
  const response = await axios.post<CodeExecutorResponse>(
    REQUEST_EXECUTION_ENPOINT,
    reqBody
  );
  return response.data;
}

const sleepNow = (delay: number) =>
  new Promise((resolve) => setTimeout(resolve, delay));

export async function pollCodeExecutionStatus(
  statusUrl: string
): Promise<CodeExecutorResponse> {
  let response = await axios.get<CodeExecutorResponse>(statusUrl);

  while (
    response.data.status !== SUCCESS_STATUS &&
    response.data.status !== FAILURE_STATUS
  ) {
    await sleepNow(1000);
    response = await axios.get<CodeExecutorResponse>(statusUrl);
  }

  return response.data;
}
