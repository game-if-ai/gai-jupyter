/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { SubmitNotebookExperimentGQL } from "gql-types";
import axios from "axios";

interface GraphQLResponse<T> {
  errors?: { message: string }[];
  data?: T;
}

export const GRAPHQL_ENDPOINT = process.env.REACT_APP_GRAPHQL_ENDPOINT;

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

export async function submitNotebookExperimentGQL(
  data: SubmitNotebookExperimentGQL
): Promise<boolean> {
  if (!GRAPHQL_ENDPOINT) {
    return false;
  }
  const mutationQuery =
    data.activityId === "cafe"
      ? cafeNotebookMutation
      : data.activityId === "fruitpicker"
      ? fruitPickerMutation
      : nmtNotebookMutation;
  const gqlRes = await axios.post<GraphQLResponse<boolean>>(GRAPHQL_ENDPOINT, {
    query: mutationQuery,
    variables: {
      cmi5LaunchParameters: data.cmi5LaunchParameters,
      activityId: data.activityId,
      notebookStateStringified: data.notebookState,
      summary: data.summary,
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
