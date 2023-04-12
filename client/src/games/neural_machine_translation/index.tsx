/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { apply } from "../../utils";
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
    "Please finish this notebook to complete the English to French translator. You will receive hints as you go.",
  simulator: new NMTSimulator(),
  improveCodeHints: [
    {
      message:
        "When using text data with a neural network, it is crucial to first tokenize it. You first need to call the tokenizer's fit_on_texts method to determine the vocabulary of the data.",
      visibility: "TRIGGERED_OR_HINT_BUTTON",
      active: (nmtCodeInfo) => {
        return !(nmtCodeInfo as NMTCodeInfo).callsFitOnTexts;
      },
    },
    {
      message:
        "You need to call the tokenizer's texts_to_sequences method to actually tokenize the input and return the tokens.",
      visibility: "TRIGGERED_OR_HINT_BUTTON",
      active: (nmtCodeInfo) => {
        return !(nmtCodeInfo as NMTCodeInfo).callsTextsToSequences;
      },
    },
    {
      message:
        "The pad_sequences function will ensure all sequences have the same length.",
      visibility: "TRIGGERED_OR_HINT_BUTTON",
      active: (nmtCodeInfo) => {
        return !(nmtCodeInfo as NMTCodeInfo).callsPadSequences;
      },
    },
    {
      message:
        "Add the padding='post' parameter to padding_sequences so that blanks are added to the end.",
      visibility: "TRIGGERED_OR_HINT_BUTTON",
      active: (nmtCodeInfo) => {
        return !(nmtCodeInfo as NMTCodeInfo).callsPadSequencesWithPaddingPost;
      },
    },
    {
      message:
        "The maximum sentence length of y is greater than x. You need to pad x again to be the same size as y using the maxlen parameter of pad_sequences.",
      visibility: "TRIGGERED_OR_HINT_BUTTON",
      active: (nmtCodeInfo) => {
        return !(nmtCodeInfo as NMTCodeInfo).callsPadSequencesTwice;
      },
    },
    {
      message:
        "Keras's sparse_categorical_crossentropy function requires the labels to be in 3 dimensions; use the numpy arrays reshape function to achieve this.",
      visibility: "TRIGGERED_OR_HINT_BUTTON",
      active: (nmtCodeInfo) => {
        return !(nmtCodeInfo as NMTCodeInfo).callsReshape;
      },
    },

    {
      message: "You need to reshape both x and y.",
      visibility: "TRIGGERED_OR_HINT_BUTTON",
      active: (nmtCodeInfo) => {
        return !(nmtCodeInfo as NMTCodeInfo).callsReshapeOnXAndY;
      },
    },

    {
      message:
        "NumPy's argmax function can be very useful in finding the highest weighted indices of the logits.",
      visibility: "TRIGGERED_OR_HINT_BUTTON",
      active: (nmtCodeInfo) => {
        return !(nmtCodeInfo as NMTCodeInfo).callsArgmax;
      },
    },

    {
      message: "Run your code to first before seeing more hints!",
      visibility: "TRIGGERED_OR_HINT_BUTTON",
      active: (nmtCodeInfo) => {
        return !(nmtCodeInfo as NMTCodeInfo).hasValidationOutput;
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
      message:
        "0 (blank) is not in the tokenizers word_index. You have to handle it yourself",
      visibility: "TRIGGERED_OR_HINT_BUTTON",
      active: (nmtCodeInfo) => {
        return (nmtCodeInfo as NMTCodeInfo).keywordZeroLookup;
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
  autocompletion: [
    {
      label: "tokenizer.fit_on_texts(x)",
      type: "text",
      apply,
      detail: "",
    },
    {
      label: "tokenizer.texts_to_sequences(x)",
      type: "text",
      apply,
      detail: "",
    },
    {
      label: 'tokenizer.pad_sequences(x, padding="post")',
      type: "text",
      apply,
      detail: "",
    },
    {
      label: "tokenizer.word_index",
      type: "text",
      apply,
      detail: "",
    },
    {
      label: "np.argmax(logits, 1)",
      type: "text",
      apply,
      detail: "",
    },
  ],
  codeExamine: useWithNMTCodeExamine,
  extractValidationCellOutput: extractNMTCellOutput,
};

export default NeuralMachineTranslation;
