/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { Fruit, Fruits, FruitTrait } from "./types";
import { Classifier } from "../../classifier";
import { random, randomInt } from "../../utils";

export interface FruitClassifierInput {
  fruit: Fruit;
  label: FruitTrait;
}

export interface FruitClassifierOutput {
  inputText: string; // description of fruit
  label: string; // trait (color, shape, etc.)
  realLabel: string; // what the fruit's trait (color, shape, etc.) was
  classifierLabel: string; // what the classifier thought it was
  confidence: number; // how confident the classifier was (0 to 1)
}

export function generateRandomFruitClassifierOutpout(): FruitClassifierOutput[] {
  const data: FruitClassifierOutput[] = [];
  for (const label of Object.values(FruitTrait)) {
    for (const fruit of Fruits) {
      const correctAnswer = random(1, 0) < 0.85; // chance to pick right answer
      data.push({
        inputText: fruit.description,
        label: label,
        realLabel: fruit.traits[label],
        classifierLabel: correctAnswer
          ? fruit.traits[label]
          : Fruits[randomInt(Fruits.length)].traits[label],
        confidence: random(1, 0),
      });
    }
  }
  return data;
}

export const FruitClassifier: Classifier = {
  classify(
    input: FruitClassifierInput,
    classifierOutput: FruitClassifierOutput[]
  ): FruitClassifierOutput | undefined {
    const { fruit, label } = input;
    const inputText = fruit.description;
    const output = classifierOutput.find(
      (d) => d.inputText === inputText && d.label === label
    );
    return output;
  },
};

export default FruitClassifier;
