/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { extractWineCellOutput } from "./hooks/examine-wine-code-helpers";
import {
  WineCodeInfo,
  useWithWineCodeExamine,
} from "./hooks/use-with-wine-code-examine";
import { Activity, ActivityID } from "../../store/simulator";
import { apply } from "../../utils";

export const Wine: Activity = {
  id: ActivityID.wine,
  title: "Wine",
  activityType: "NOTEBOOK_ONLY",
  gameDescription: "",
  notebookDescription:
    "This notebook clusters wines based on their chemical properties. Please complete the data preprocessing function and choose a value for k (the number of clusters) based on the Clustering Cliff Notes. You will receive hints as you go.",
  improveCodeHints: [
    {
      message:
        "You need to drop the 'Wine' column because it isn't a useful feature.",
      visibility: "TRIGGERED_OR_HINT_BUTTON",
      conditionDescription: "Checks that the user has dropped the wine column.",
      active: (nmtCodeInfo) => {
        return !(nmtCodeInfo as WineCodeInfo).dropsWineColumn;
      },
    },
    {
      message:
        "In the drop method, you need to use the parameter setting 'axis=1' since you are dropping a column.",
      visibility: "TRIGGERED_OR_HINT_BUTTON",
      conditionDescription:
        "Checks that the user has dropped the wine column with axis=1.",
      active: (nmtCodeInfo) => {
        return !(nmtCodeInfo as WineCodeInfo).dropsWineColumnWithAxis;
      },
    },
    {
      message:
        "You need to drop the 'quality' column to separate the labels from the data.",
      visibility: "TRIGGERED_OR_HINT_BUTTON",
      conditionDescription:
        "Checks that the user has dropped the quality column.",
      active: (nmtCodeInfo) => {
        return !(nmtCodeInfo as WineCodeInfo).dropsQualityColumn;
      },
    },
    {
      message: "Are you saving the 'quality' column before dropping it?",
      visibility: "TRIGGERED_OR_HINT_BUTTON",
      conditionDescription:
        "Checks that the user has saved the quality column before dropping it.",
      active: (nmtCodeInfo) => {
        return !(nmtCodeInfo as WineCodeInfo).savesQualityColumnBeforeDropping;
      },
    },
    {
      message:
        "In the drop method, you need to use the parameter setting 'axis=1' since you are dropping a column.",
      visibility: "TRIGGERED_OR_HINT_BUTTON",
      conditionDescription:
        "Checks that the user has dropped the quality column with axis=1.",
      active: (nmtCodeInfo) => {
        return !(nmtCodeInfo as WineCodeInfo).dropsQualityColumnWithAxis;
      },
    },
    {
      message: "You need to create a StandardScaler object.",
      visibility: "TRIGGERED_OR_HINT_BUTTON",
      conditionDescription:
        "Checks that the user has used the StandardScaler method.",
      active: (nmtCodeInfo) => {
        return !(nmtCodeInfo as WineCodeInfo).usesStandardScaler;
      },
    },
    {
      message: "You need to fit the StandardScaler to the data",
      visibility: "TRIGGERED_OR_HINT_BUTTON",
      conditionDescription:
        "Checks that the user has fit the StandardScaler method.",
      active: (nmtCodeInfo) => {
        return !(nmtCodeInfo as WineCodeInfo).fitsWithStandardScaler;
      },
    },
    {
      message: "You need to use the transform method to scale the data.",
      visibility: "TRIGGERED_OR_HINT_BUTTON",
      conditionDescription:
        "Checks that the user has transformed the data with the StandardScaler method.",
      active: (nmtCodeInfo) => {
        return !(nmtCodeInfo as WineCodeInfo).transformsWithStandardScaler;
      },
    },
    {
      message:
        "The output of transform is an ndarray. You need to convert this into a DataFrame. Use pd.DataFrame with 'columns=wineDataFrame.columns' to convert the ndarray to a DataFrame",
      visibility: "TRIGGERED_OR_HINT_BUTTON",
      conditionDescription:
        "Checks that the user has used the dataframe object.",
      active: (nmtCodeInfo) => {
        return !(nmtCodeInfo as WineCodeInfo).usesDataframe;
      },
    },
  ],
  autocompletion: [
    {
      label: "StandardScaler()",
      type: "text",
      apply,
      detail: "",
    },
    {
      label: "pd.DataFrame()",
      type: "text",
      apply,
      detail: "",
    },
    {
      label: "wineDataFrame.drop()",
      type: "text",
      apply,
      detail: "",
    },
    {
      label: "columns=wineDataFrame.columns",
      type: "text",
      apply,
      detail: "",
    },
    {
      label: ".transform()",
      type: "text",
      apply,
      detail: "",
    },
  ],
  codeExamine: useWithWineCodeExamine,
  extractValidationCellOutput: extractWineCellOutput,
};

export default Wine;
