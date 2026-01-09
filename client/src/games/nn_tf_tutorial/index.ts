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
        "Start by preprocessing your image data. Think about how to scale pixel values from their current range to a normalized range between 0 and 1. This is an important first step before feeding data into a neural network.",
      visibilityConditions: [
        HintVisibilityCondition.HINT_BUTTON_CLICKED,
        HintVisibilityCondition.TRIGGERED_ON_NOTEBOOK_RETURN,
        HintVisibilityCondition.MUST_BE_ACTIVE,
      ],
      conditionDescription:
        "Checks that the user has normalized the training images.",
      active: (nntfCodeInfo) => {
        return !(nntfCodeInfo as NNTFCodeInfo).trainImageNormalization;
      },
    },
    {
      message:
        "You've normalized the training images - great! Now apply the same normalization technique to your test images to ensure consistency across your datasets.",
      visibilityConditions: [
        HintVisibilityCondition.HINT_BUTTON_CLICKED,
        HintVisibilityCondition.TRIGGERED_ON_NOTEBOOK_RETURN,
        HintVisibilityCondition.MUST_BE_ACTIVE,
      ],
      conditionDescription:
        "Checks that the user has normalized both training and test images.",
      active: (nntfCodeInfo) => {
        const codeInfo = nntfCodeInfo as NNTFCodeInfo;
        return !codeInfo.testImageNormalization;
      },
    },
    {
      message:
        "Now focus on building your neural network architecture. The hidden dense layer needs a specific number of units (neurons). Consider using a power of 2 like 64, 128, or 256 for better computational efficiency.",
      visibilityConditions: [
        HintVisibilityCondition.HINT_BUTTON_CLICKED,
        HintVisibilityCondition.TRIGGERED_ON_NOTEBOOK_RETURN,
        HintVisibilityCondition.MUST_BE_ACTIVE,
      ],
      conditionDescription:
        "Checks that the user has specified hidden layer units.",
      active: (nntfCodeInfo) => {
        return !(nntfCodeInfo as NNTFCodeInfo).hiddenLayerUnits;
      },
    },
    {
      message:
        "Good progress on the layer units! Now specify the activation function for your hidden layer. For hidden layers in this type of network, 'relu' is a popular choice that helps the network learn non-linear patterns.",
      visibilityConditions: [
        HintVisibilityCondition.HINT_BUTTON_CLICKED,
        HintVisibilityCondition.TRIGGERED_ON_NOTEBOOK_RETURN,
        HintVisibilityCondition.MUST_BE_ACTIVE,
      ],
      conditionDescription:
        "Checks that the user has specified the hidden layer activation function.",
      active: (nntfCodeInfo) => {
        return !(nntfCodeInfo as NNTFCodeInfo).hiddenLayerActivation;
      },
    },
    {
      message:
        "Your network architecture is taking shape! Now configure the model compilation. Choose an optimizer - 'adam' is a robust choice that works well for most neural networks.",
      visibilityConditions: [
        HintVisibilityCondition.HINT_BUTTON_CLICKED,
        HintVisibilityCondition.TRIGGERED_ON_NOTEBOOK_RETURN,
        HintVisibilityCondition.MUST_BE_ACTIVE,
      ],
      conditionDescription:
        "Checks that the user has specified the model optimizer.",
      active: (nntfCodeInfo) => {
        return !(nntfCodeInfo as NNTFCodeInfo).modelOptimizer;
      },
    },
    {
      message:
        "Good! You've selected an optimizer. Now choose an appropriate loss function. Since you're working with multi-class classification where labels are integers (not one-hot encoded), look for a loss function that handles sparse categorical data.",
      visibilityConditions: [
        HintVisibilityCondition.HINT_BUTTON_CLICKED,
        HintVisibilityCondition.TRIGGERED_ON_NOTEBOOK_RETURN,
        HintVisibilityCondition.MUST_BE_ACTIVE,
      ],
      conditionDescription:
        "Checks that the user has specified the loss function.",
      active: (nntfCodeInfo) => {
        return !(nntfCodeInfo as NNTFCodeInfo).lossFunction;
      },
    },
    {
      message:
        "Excellent compilation setup! Now prepare the fit() method call. Pass your training images as the first argument to provide the feature data for training.",
      visibilityConditions: [
        HintVisibilityCondition.HINT_BUTTON_CLICKED,
        HintVisibilityCondition.TRIGGERED_ON_NOTEBOOK_RETURN,
        HintVisibilityCondition.MUST_BE_ACTIVE,
      ],
      conditionDescription:
        "Checks that the user has passed training data to fit().",
      active: (nntfCodeInfo) => {
        return !(nntfCodeInfo as NNTFCodeInfo).fitTrainingData;
      },
    },
    {
      message:
        "Great! You're passing the training images. Now add the training labels as the second argument to the fit() method so the model knows what to learn.",
      visibilityConditions: [
        HintVisibilityCondition.HINT_BUTTON_CLICKED,
        HintVisibilityCondition.TRIGGERED_ON_NOTEBOOK_RETURN,
        HintVisibilityCondition.MUST_BE_ACTIVE,
      ],
      conditionDescription:
        "Checks that the user has passed training labels to fit().",
      active: (nntfCodeInfo) => {
        return !(nntfCodeInfo as NNTFCodeInfo).fitTrainingLabels;
      },
    },
    {
      message:
        "You're making good progress on the training setup! Now specify the validation_split parameter. This reserves a portion of your training data (typically 10-20%) to validate performance during training without using test data.",
      visibilityConditions: [
        HintVisibilityCondition.HINT_BUTTON_CLICKED,
        HintVisibilityCondition.TRIGGERED_ON_NOTEBOOK_RETURN,
        HintVisibilityCondition.MUST_BE_ACTIVE,
      ],
      conditionDescription:
        "Checks that the user has specified the validation_split parameter.",
      active: (nntfCodeInfo) => {
        return !(nntfCodeInfo as NNTFCodeInfo).validationSplitRatio;
      },
    },
    {
      message:
        "Almost there! Set the number of epochs for training. This determines how many times the model will iterate over the entire training dataset. Start with a reasonable number like 10 and adjust based on your training performance.",
      visibilityConditions: [
        HintVisibilityCondition.HINT_BUTTON_CLICKED,
        HintVisibilityCondition.TRIGGERED_ON_NOTEBOOK_RETURN,
        HintVisibilityCondition.MUST_BE_ACTIVE,
      ],
      conditionDescription:
        "Checks that the user has specified the number of epochs.",
      active: (nntfCodeInfo) => {
        return !(nntfCodeInfo as NNTFCodeInfo).trainingEpochs;
      },
    },
    {
      message:
        "Your model is now ready to be trained! Try running your code to see how it performs.",
      visibilityConditions: [
        HintVisibilityCondition.HINT_BUTTON_CLICKED,
        HintVisibilityCondition.TRIGGERED_ON_NOTEBOOK_RETURN,
        HintVisibilityCondition.MUST_BE_ACTIVE,
      ],
      conditionDescription: "Checks that the user has trained the model.",
      active: (nntfCodeInfo) => {
        return true;
      },
    },
  ],
  autocompletion: [
    {
      label: "train_images = train_images / ",
      type: "text",
      apply,
      detail: "",
    },
    {
      label: "test_images = test_images / ",
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
      label: "optimizer='adam'",
      type: "text",
      apply,
      detail: "",
    },
    {
      label: "optimizer='sgd'",
      type: "text",
      apply,
      detail: "",
    },
    {
      label: "tf.keras.losses.SparseCategoricalCrossentropy(...)",
      type: "text",
      apply,
      detail: "",
    },
    {
      label: "loss='sparse_categorical_crossentropy'",
      type: "text",
      apply,
      detail: "",
    },
    {
      label: "model.fit(...)",
      type: "text",
      apply,
      detail: "",
    },
    {
      label: "validation_split=",
      type: "text",
      apply,
      detail: "",
    },
    {
      label: "epochs=",
      type: "text",
      apply,
      detail: "",
    },
  ],
  codeExamine: useWithNNTFCodeExamine,
  extractValidationCellOutput: extractNNTFCellOutput,
};

export default NNTF;
