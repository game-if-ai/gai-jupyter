/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { Review } from "./types";
import { Classifier } from "../../classifier";
import { random, randomInt } from "../../utils";

export interface ClassifierInput {
  review: Review;
}

export interface ClassifierOutput {
  inputText: string; // review text
  realLabel: number; // what the review's rating was
  classifierLabel: number; // what the classifier thought it was
  confidence: number; // how confident the classifier was (0 to 1)
}

export const ReviewClassifier: Classifier = {
  classify(input: ClassifierInput): ClassifierOutput | undefined {
    const { review } = input;
    return {
      inputText: review.review,
      realLabel: review.rating,
      classifierLabel: randomInt(1, 0),
      confidence: random(1, 0),
    };
  },
};

export default ReviewClassifier;
