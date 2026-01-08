/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { extractNNTFCellOutput } from "./hooks/examine-nn-tf-code-helpers";
import {
  NNTFCodeInfo,
  useWithNNTFCodeExamine,
} from "./hooks/use-with-nn-tf-code-examine";
import { Activity, ActivityID } from "../../store/simulator";
import { apply } from "../../utils";
import { HintVisibilityCondition } from "../../hooks/use-with-improve-code";

export const NNTF: Activity = {
  id: ActivityID.nntf,
  title: "Neural Network with TensorFlow Tutorial",
  activityType: "NOTEBOOK_ONLY",
  gameDescription: "",
  notebookDescription:
    "This notebook is a tutorial on how to build a neural network with TensorFlow. You will receive hints as you go.",
  improveCodeHints: [
    {
      message:
        "Make sure to scale the pixel values of the training images to be between 0 and 1.",
      visibilityConditions: [
        HintVisibilityCondition.HINT_BUTTON_CLICKED,
        HintVisibilityCondition.TRIGGERED_ON_NOTEBOOK_RETURN,
        HintVisibilityCondition.MUST_BE_ACTIVE,
      ],
      conditionDescription: "Checks that the user has scaled the pixel values.",
      active: (nntfCodeInfo) => {
        return !(nntfCodeInfo as NNTFCodeInfo).normalizeTrainImages;
      },
    },
    {
      message:
        "Don't forget to scale the test images' pixel values to be between 0 and 1 as well.",
      visibilityConditions: [
        HintVisibilityCondition.HINT_BUTTON_CLICKED,
        HintVisibilityCondition.TRIGGERED_ON_NOTEBOOK_RETURN,
        HintVisibilityCondition.MUST_BE_ACTIVE,
      ],
      conditionDescription:
        "Checks that the user has normalized the test images.",
      active: (nntfCodeInfo) => {
        return !(nntfCodeInfo as NNTFCodeInfo).normalizeTestImages;
      },
    },
    {
      message:
        "Consider adding a dense layer with some neurons and using a ReLU activation function.",
      visibilityConditions: [
        HintVisibilityCondition.HINT_BUTTON_CLICKED,
        HintVisibilityCondition.TRIGGERED_ON_NOTEBOOK_RETURN,
        HintVisibilityCondition.MUST_BE_ACTIVE,
      ],
      conditionDescription:
        "Checks that the user has added a softmax dense layer.",
      active: (nntfCodeInfo) => {
        return !(nntfCodeInfo as NNTFCodeInfo).addReluDenseLayer;
      },
    },
    {
      message:
        "Remember to add an output layer with 10 units corresponding to the number of classes, using a softmax activation function.",
      visibilityConditions: [
        HintVisibilityCondition.HINT_BUTTON_CLICKED,
        HintVisibilityCondition.TRIGGERED_ON_NOTEBOOK_RETURN,
        HintVisibilityCondition.MUST_BE_ACTIVE,
      ],
      conditionDescription:
        "Checks that the user has added a softmax dense layer.",
      active: (nntfCodeInfo) => {
        return !(nntfCodeInfo as NNTFCodeInfo).addSoftmaxDenseLayer;
      },
    },
    {
      message:
        "Select an optimizer for your model. 'adam' is often a good choice for many tasks.",
      visibilityConditions: [
        HintVisibilityCondition.HINT_BUTTON_CLICKED,
        HintVisibilityCondition.TRIGGERED_ON_NOTEBOOK_RETURN,
        HintVisibilityCondition.MUST_BE_ACTIVE,
      ],
      conditionDescription:
        "Checks that the user has specified the Adam optimizer.",
      active: (nntfCodeInfo) => {
        return !(nntfCodeInfo as NNTFCodeInfo).specifyAdamOptimizer;
      },
    },
    {
      message:
        "Choose an appropriate loss function for your classification task. Sparse Categorical Crossentropy is commonly used.",
      visibilityConditions: [
        HintVisibilityCondition.HINT_BUTTON_CLICKED,
        HintVisibilityCondition.TRIGGERED_ON_NOTEBOOK_RETURN,
        HintVisibilityCondition.MUST_BE_ACTIVE,
      ],
      conditionDescription:
        "Checks that the user has specified the Sparse Categorical Crossentropy loss function.",
      active: (nntfCodeInfo) => {
        return !(nntfCodeInfo as NNTFCodeInfo)
          .specifySparseCategoricalCrossentropy;
      },
    },
    {
      message:
        "Decide on the number of epochs to train your model. Consider how many training cycles might be adequate for convergence.",
      visibilityConditions: [
        HintVisibilityCondition.HINT_BUTTON_CLICKED,
        HintVisibilityCondition.TRIGGERED_ON_NOTEBOOK_RETURN,
        HintVisibilityCondition.MUST_BE_ACTIVE,
      ],
      conditionDescription:
        "Checks that the user has specified the number of epochs.",
      active: (nntfCodeInfo) => {
        return !(nntfCodeInfo as NNTFCodeInfo).specifyEpochs;
      },
    },
    {
      message:
        "Use your model to make predictions on new data. Recall how the predict method is used with input data.",
      visibilityConditions: [
        HintVisibilityCondition.HINT_BUTTON_CLICKED,
        HintVisibilityCondition.TRIGGERED_ON_NOTEBOOK_RETURN,
        HintVisibilityCondition.MUST_BE_ACTIVE,
      ],
      conditionDescription: "Checks that the user has used the predict method.",
      active: (nntfCodeInfo) => {
        return !(nntfCodeInfo as NNTFCodeInfo).usesModelPredict;
      },
    },
    {
      message:
        "To determine the predicted classes, use a method to find the index of the maximum predicted probability for each sample.",
      visibilityConditions: [
        HintVisibilityCondition.HINT_BUTTON_CLICKED,
        HintVisibilityCondition.TRIGGERED_ON_NOTEBOOK_RETURN,
        HintVisibilityCondition.MUST_BE_ACTIVE,
      ],
      conditionDescription:
        "Checks that the user has used the np.argmax method.",
      active: (nntfCodeInfo) => {
        return !(nntfCodeInfo as NNTFCodeInfo).usesNpArgmax;
      },
    },
    {
      message: "Everything looks good. Run your code to see how it performs.",
      visibilityConditions: [
        HintVisibilityCondition.HINT_BUTTON_CLICKED,
        HintVisibilityCondition.TRIGGERED_ON_NOTEBOOK_RETURN,
      ],
      conditionDescription: "complete",
      active: (nmtCodeInfo) => {
        return true;
      },
    },
  ],
  autocompletion: [
    {
      label: "train_images / 255.0",
      type: "text",
      apply,
      detail: "",
    },
    {
      label: "test_images / 255.0",
      type: "text",
      apply,
      detail: "",
    },
    {
      label: "tf.keras.layers.Dense(...)",
      type: "text",
      apply,
      detail: "",
    },
    {
      label: "activation='relu'",
      type: "text",
      apply,
      detail: "",
    },
    {
      label: "activation='softmax'",
      type: "text",
      apply,
      detail: "",
    },
    {
      label: "optimizer='...' ",
      type: "text",
      apply,
      detail: "",
    },
    {
      label: "tf.keras.losses.SparseCategoricalCrossentropy()",
      type: "text",
      apply,
      detail: "",
    },
    {
      label: "epochs=...",
      type: "text",
      apply,
      detail: "",
    },
    {
      label: "model.predict(...)",
      type: "text",
      apply,
      detail: "",
    },
    {
      label: "np.argmax(..., axis=-1)",
      type: "text",
      apply,
      detail: "",
    },
  ],
  codeExamine: useWithNNTFCodeExamine,
  extractValidationCellOutput: extractNNTFCellOutput,
};

export default NNTF;
