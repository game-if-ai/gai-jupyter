/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { CodeExecutorResponseData } from "../../support/types";

export const executeNmtRes = (console?: string): CodeExecutorResponseData => {
  return {
    id: "c4d97c8d-b35a-4b3e-a10a-88feca559b71",
    status: "SUCCESS",
    state: "SUCCESS",
    result: [
      "{}",
      "\"English\\n * preproc_english_sentences_type: <class 'numpy.ndarray'>\\n * preproc_english_sentences_shape: (137861, 21, 1)\\nFrench\\n * preproc_french_sentences_type: <class 'numpy.ndarray'>\\n * preproc_french_sentences_shape: (137861, 21, 1)\\nTest Case - English to French\\n * English sentence: new jersey is sometimes quiet during autumn , and it is snowy in april .\\n * Actual translation: new jersey est parfois calme pendant l' automne , et il est neigeux en avril .\\n * Predicted translation: new jersey est jamais chaud en l' et il est est en en        \\n\"",
    ],
    console: "X Raw Shape: (137861, 15)\nY Raw Shape: (137861, 21)\n",
    statusUrl: "/execute/status/c4d97c8d-b35a-4b3e-a10a-88feca559b71",
  };
};
