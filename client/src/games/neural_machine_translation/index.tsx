/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { extractNMTCellOutput } from "./hooks/examine-nn-code-helpers";
import {
  NMTCodeInfo,
  useWithNMTCodeExamine,
} from "./hooks/use-with-nn-code-examine";
import { Activity, ActivityID } from "../../store/simulator";
import { apply } from "../../utils";
import { HintVisibilityCondition } from "../../hooks/use-with-improve-code";

export const NeuralMachineTranslation: Activity = {
  id: ActivityID.nmt,
  title: "Neural Machine Translation",
  activityType: "NOTEBOOK_ONLY",
  gameDescription: "",
  notebookDescription:
    "Please finish this notebook to complete the English to French translator. You will receive hints as you go.",
  improveCodeHints: [
    {
      message:
        "When using text data with a neural network, it is crucial to first tokenize it. You need to add this as the first line of tokenize_and_pad: tokenizer.fit_on_texts(x)",
      visibilityConditions: [
        HintVisibilityCondition.HINT_BUTTON_CLICKED,
        HintVisibilityCondition.TRIGGERED_ON_NOTEBOOK_RETURN,
        HintVisibilityCondition.MUST_BE_ACTIVE,
      ],
      conditionDescription:
        "Checks that the user has called the fit_on_texts function.",
      active: (nmtCodeInfo) => {
        return !(nmtCodeInfo as NMTCodeInfo).callsFitOnTexts;
      },
    },
    {
      message:
        "To tokenize the input and return the tokens, you need to use this code to get the tokens: tokenizer.texts_to_sequences(x)",
      visibilityConditions: [
        HintVisibilityCondition.HINT_BUTTON_CLICKED,
        HintVisibilityCondition.TRIGGERED_ON_NOTEBOOK_RETURN,
        HintVisibilityCondition.MUST_BE_ACTIVE,
      ],
      conditionDescription:
        "Checks that the user has called the texts_to_sequences function.",
      active: (nmtCodeInfo) => {
        return !(nmtCodeInfo as NMTCodeInfo).callsTextsToSequences;
      },
    },
    {
      message:
        "The pad_sequences function will ensure all sequences have the same length. Example code: pad_sequences(tokenizer.texts_to_sequences(x), padding='post')",
      visibilityConditions: [
        HintVisibilityCondition.HINT_BUTTON_CLICKED,
        HintVisibilityCondition.TRIGGERED_ON_NOTEBOOK_RETURN,
        HintVisibilityCondition.MUST_BE_ACTIVE,
      ],
      conditionDescription:
        "Checks that the user has called the pad_sequences function.",
      active: (nmtCodeInfo) => {
        return !(nmtCodeInfo as NMTCodeInfo).callsPadSequences;
      },
    },
    {
      message:
        "Add the padding='post' parameter to padding_sequences so that blanks are added to the end.",
      visibilityConditions: [
        HintVisibilityCondition.HINT_BUTTON_CLICKED,
        HintVisibilityCondition.TRIGGERED_ON_NOTEBOOK_RETURN,
        HintVisibilityCondition.MUST_BE_ACTIVE,
      ],
      conditionDescription:
        "Checks that the user has called the pad_sequences function with the padding='post' param set.",

      active: (nmtCodeInfo) => {
        return !(nmtCodeInfo as NMTCodeInfo).callsPadSequencesWithPaddingPost;
      },
    },
    {
      message:
        "The maximum sentence length of y is greater than x. You need to pad x again to be the same size as y using the maxlen parameter of pad_sequences. Example code: pad_sequences(raw_x, maxlen=raw_y.shape[1], padding'post')",
      visibilityConditions: [
        HintVisibilityCondition.HINT_BUTTON_CLICKED,
        HintVisibilityCondition.TRIGGERED_ON_NOTEBOOK_RETURN,
        HintVisibilityCondition.MUST_BE_ACTIVE,
      ],
      conditionDescription:
        "Checks that the user has called the pad_sequences function twice.",

      active: (nmtCodeInfo) => {
        return !(nmtCodeInfo as NMTCodeInfo).callsPadSequencesTwice;
      },
    },
    {
      message:
        "Keras's sparse_categorical_crossentropy function requires the labels to be in 3 dimensions; if padded_x is an ndarray, you can use the following code to add an extra dimension of size 1: padded_x.reshape(*padded_x.shape, 1)",
      visibilityConditions: [
        HintVisibilityCondition.HINT_BUTTON_CLICKED,
        HintVisibilityCondition.TRIGGERED_ON_NOTEBOOK_RETURN,
        HintVisibilityCondition.MUST_BE_ACTIVE,
      ],
      conditionDescription:
        "Checks that the user has called the reshape function.",

      active: (nmtCodeInfo) => {
        return !(nmtCodeInfo as NMTCodeInfo).callsReshape;
      },
    },

    {
      message: "You need to reshape both x and y.",
      conditionDescription:
        "Checks that the user has called reshape on both x and y.",

      visibilityConditions: [
        HintVisibilityCondition.HINT_BUTTON_CLICKED,
        HintVisibilityCondition.TRIGGERED_ON_NOTEBOOK_RETURN,
        HintVisibilityCondition.MUST_BE_ACTIVE,
      ],
      active: (nmtCodeInfo) => {
        return !(nmtCodeInfo as NMTCodeInfo).callsReshapeOnXAndY;
      },
    },
    {
      message:
        "Consider the output, all possible words have a logit probability. NumPy's argmax function can help pick the best word with the highest weighted index. Example code: np.argmax(logits,1)",
      conditionDescription:
        "Checks that the user has called the argmax function.",

      visibilityConditions: [
        HintVisibilityCondition.HINT_BUTTON_CLICKED,
        HintVisibilityCondition.TRIGGERED_ON_NOTEBOOK_RETURN,
        HintVisibilityCondition.MUST_BE_ACTIVE,
      ],
      active: (nmtCodeInfo) => {
        return !(nmtCodeInfo as NMTCodeInfo).callsArgmax;
      },
    },
    {
      message:
        "When argmax is used on a 2D array of logits, you are then given a single list of word indices.",
      conditionDescription:
        "Checks that the user has called the argmax function.",
      visibilityConditions: [
        HintVisibilityCondition.HINT_BUTTON_CLICKED,
        HintVisibilityCondition.TRIGGERED_ON_NOTEBOOK_RETURN,
        HintVisibilityCondition.MUST_BE_ACTIVE,
      ],
      active: (nmtCodeInfo) => {
        return !(nmtCodeInfo as NMTCodeInfo).callsArgmax;
      },
    },
    {
      message: "Run your code first before seeing more hints!",
      visibilityConditions: [
        HintVisibilityCondition.HINT_BUTTON_CLICKED,
        HintVisibilityCondition.TRIGGERED_ON_NOTEBOOK_RETURN,
        HintVisibilityCondition.MUST_BE_ACTIVE,
      ],
      conditionDescription:
        "Checks that the validation cell has an output (indicating that the user ran their code).",
      active: (nmtCodeInfo) => {
        return !(nmtCodeInfo as NMTCodeInfo).hasValidationOutput;
      },
    },
    {
      message:
        "Your data must be a numpy array to continue. Please double check your code.",
      conditionDescription:
        "Checks that their data is of the correct data type.",

      visibilityConditions: [
        HintVisibilityCondition.HINT_BUTTON_CLICKED,
        HintVisibilityCondition.TRIGGERED_ON_NOTEBOOK_RETURN,
        HintVisibilityCondition.MUST_BE_ACTIVE,
      ],
      active: (nmtCodeInfo) => {
        return !(nmtCodeInfo as NMTCodeInfo).dataIsNumpyArray;
      },
    },
    {
      message:
        "Your data is not correctly shaped, please double check. (Expected shape (137861, 21, 1))",
      conditionDescription:
        "Checks that their data is of the correct shape (Expected shape (137861, 21, 1)).",

      visibilityConditions: [
        HintVisibilityCondition.HINT_BUTTON_CLICKED,
        HintVisibilityCondition.TRIGGERED_ON_NOTEBOOK_RETURN,
        HintVisibilityCondition.MUST_BE_ACTIVE,
      ],
      active: (nmtCodeInfo) => {
        return !(nmtCodeInfo as NMTCodeInfo).preprocessedDataCorrectDimensions;
      },
    },
    {
      message:
        "0 (blank) is not in the tokenizers word_index. You have to handle it yourself",
      conditionDescription:
        "If there is a KeyError output in the validation cell.",

      visibilityConditions: [
        HintVisibilityCondition.HINT_BUTTON_CLICKED,
        HintVisibilityCondition.TRIGGERED_ON_NOTEBOOK_RETURN,
        HintVisibilityCondition.MUST_BE_ACTIVE,
      ],
      active: (nmtCodeInfo) => {
        return (nmtCodeInfo as NMTCodeInfo).keywordZeroLookup;
      },
    },
    {
      message:
        "Remember to join the output so that it forms a single string (' '.join(output_words)",
      conditionDescription: "if there is no join call present",
      visibilityConditions: [
        HintVisibilityCondition.HINT_BUTTON_CLICKED,
        HintVisibilityCondition.TRIGGERED_ON_NOTEBOOK_RETURN,
        HintVisibilityCondition.MUST_BE_ACTIVE,
      ],
      active: (nmtCodeInfo) => {
        return !(nmtCodeInfo as NMTCodeInfo).callsJoin;
      },
    },
    {
      message: "You're looking good!",
      conditionDescription: "always true",
      visibilityConditions: [
        HintVisibilityCondition.HINT_BUTTON_CLICKED,
        HintVisibilityCondition.TRIGGERED_ON_NOTEBOOK_RETURN,
      ],
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
      label: 'pad_sequences(x, padding="post")',
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
    {
      label: ".reshape()",
      type: "text",
      apply,
      detail: "",
    },
  ],
  codeExamine: useWithNMTCodeExamine,
  extractValidationCellOutput: extractNMTCellOutput,
};

export default NeuralMachineTranslation;
