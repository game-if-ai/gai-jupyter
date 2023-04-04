/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { Activity } from "..";
import { extractNMTCellOutput } from "./hooks/examine-nn-code-helpers";
import {
  NMTCodeInfo,
  useWithNMTCodeExamine,
} from "./hooks/use-with-nn-code-examine";
import { NMTSimulator } from "./simulator";

export const NeuralMachineTranslation: Activity = {
  id: "neural_machine_translation",
  title: "Neural Machine Translation",
  activityType: "NOTEBOOK_ONLY",
  description:
    "You are both trying to preprocess data to be input into a neural network as well as postprocess the data output from the neural network.",
  simulator: new NMTSimulator(),
  improveCodeHints: [
    {
      message:
        "When using word data with a neural network, it is crucial to first tokenize it. (Consider using the tokenizers fit_to_texts and texts_to_sequences functions)",
      visibility: "TRIGGERED_OR_HINT_BUTTON",
      active: (nmtCodeInfo) => {
        return !(nmtCodeInfo as NMTCodeInfo).utilizesTokenizerWordIndex;
      },
    },
    {
      message:
        "Your data entries are required to be of equal length, this can be achieved by utilizing the pad_sequences function.",
      visibility: "TRIGGERED_OR_HINT_BUTTON",
      active: (nmtCodeInfo) => {
        return !(nmtCodeInfo as NMTCodeInfo).padsData;
      },
    },
    {
      message:
        "Keras's sparse_categorical_crossentropy function requires the labels to be in 3 dimensions; use the numpy arrays reshape function to achieve this.",
      visibility: "TRIGGERED_OR_HINT_BUTTON",
      active: (nmtCodeInfo) => {
        return !(nmtCodeInfo as NMTCodeInfo).reshapesData;
      },
    },
    {
      message:
        "Be sure to utilize the tokenizers word_index to convert the predictions arbitrary id's to human readable words.",
      visibility: "TRIGGERED_OR_HINT_BUTTON",
      active: (nmtCodeInfo) => {
        return !(nmtCodeInfo as NMTCodeInfo).utilizesTokenizerWordIndex;
      },
    },
    {
      message:
        "Numpys argmax function can be very useful in finding the highest weighted indices of the logits.",
      visibility: "TRIGGERED_OR_HINT_BUTTON",
      active: (nmtCodeInfo) => {
        return !(nmtCodeInfo as NMTCodeInfo).utilizesArgmax;
      },
    },
    {
      message:
        "Your data must be a numpy array to continue. Please double check your code.",
      visibility: "TRIGGERED_OR_HINT_BUTTON",
      active: (nmtCodeInfo) => {
        return !(nmtCodeInfo as NMTCodeInfo).dataIsNumpyArray;
      },
    },
    {
      message:
        "Your data is not correctly shaped, please double check. (Expected shape (137861, 21, 1))",
      visibility: "TRIGGERED_OR_HINT_BUTTON",
      active: (nmtCodeInfo) => {
        return !(nmtCodeInfo as NMTCodeInfo).preprocessedDataCorrectDimensions;
      },
    },
    {
      message: "You're looking good!",
      visibility: "TRIGGERED_OR_HINT_BUTTON",
      active: () => {
        return true;
      },
    },
  ],
  codeExamine: useWithNMTCodeExamine,
  extractValidationCellOutput: extractNMTCellOutput,
};

export default NeuralMachineTranslation;
