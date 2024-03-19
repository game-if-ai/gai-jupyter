/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  complete,
  useFitOnTextsTokenize,
  usePadSequences,
  useTextToSequences,
  usesReshape,
} from "../fixtures/nmt/code-inputs";
import { executeNmtRes } from "../fixtures/nmt/execute-nmt-res";
import {
  cyMockDefault,
  cyMockExecuteResponse,
  replaceModelCellWithCode,
} from "../support/functions";

import { CodeExecutorResponseData } from "../support/types";

function initActivity(cy) {
  cyMockDefault(cy);
  cy.visit("/?activity=neural_machine_translation");
  // Currently have to wait for jupyter notebooks to load
  // TODO: remove timeout once we no longer use jupyter labs
  cy.get("[data-cy=okay-btn]", { timeout: 8000 }).click();
}

describe("nmt notebook", () => {
  it("hints displayed properly", () => {
    cyMockExecuteResponse<CodeExecutorResponseData>(cy, {
      responses: [
        {
          resData: executeNmtRes(),
          statusCode: 200,
        },
      ],
    });
    initActivity(cy);
    cy.get("[data-cy=hint-btn]").trigger("mouseover").click();
    cy.contains(
      "When using text data with a neural network, it is crucial to first tokenize it."
    );
    replaceModelCellWithCode(cy, useFitOnTextsTokenize, 0);
    cy.get("[data-cy=hint-btn]").trigger("mouseover").click();
    cy.contains(
      "To tokenize the input and return the tokens, you need to use this code to get the tokens: tokenizer.texts_to_sequences(x)"
    );
    replaceModelCellWithCode(cy, useTextToSequences, 0);
    cy.get("[data-cy=hint-btn]").trigger("mouseover").click();
    cy.contains("The maximum sentence length of y is greater than x.");
    replaceModelCellWithCode(cy, usePadSequences, 0);
    cy.get("[data-cy=hint-btn]").trigger("mouseover").click();
    cy.contains(
      "Keras's sparse_categorical_crossentropy function requires the labels to be in 3 dimensions; if padded_x is an ndarray, you can use the following code to add an extra dimension of size 1: padded_x.reshape(*padded_x.shape, 1)"
    );
    replaceModelCellWithCode(cy, usesReshape, 0);
    cy.get("[data-cy=hint-btn]").trigger("mouseover").click();
    cy.contains(
      "Consider the output, all possible words have a logit probability."
    );
    replaceModelCellWithCode(cy, complete, 0);
    cy.get("[data-cy=hint-btn]").trigger("mouseover").click();
    cy.contains("Run your code first before seeing more hints!");
    cy.get("[data-cy=save-btn]").click();
    cy.wait(3000);
    cy.get("body").click(100, 100); // click off layover to close
    cy.get("[data-cy=hint-btn]").click();
    cy.contains("You're looking good");
  });

  it("summary shows training instances and statistics", () => {
    cyMockExecuteResponse<CodeExecutorResponseData>(cy, {
      responses: [
        {
          resData: executeNmtRes(),
          statusCode: 200,
        },
      ],
    });
    initActivity(cy);
    replaceModelCellWithCode(cy, complete, 0);
    cy.get("[data-cy=save-btn]").click();
    cy.get("[data-cy=view-sum-btn]").click();
    cy.get("[data-cy=current-experiment-container]").within(() => {
      cy.get("[data-cy=data-table-row-0]").within(() => {
        cy.contains("Utilizes the tokenizers fit_on_texts function");
        cy.contains("true");
      });
      cy.get("[data-cy=data-table-row-1]").within(() => {
        cy.contains("Utilizes the tokenizers texts_to_sequences function");
        cy.contains("true");
      });
      cy.get("[data-cy=data-table-row-2]").within(() => {
        cy.contains("Properly pads data");
        cy.contains("true");
      });
      cy.get("[data-cy=data-table-row-3]").within(() => {
        cy.contains("Reshapes data to proper dimensions");
        cy.contains("true");
      });
      cy.get("[data-cy=data-table-row-4]").within(() => {
        cy.contains("Utilizes Argmax");
        cy.contains("true");
      });
      cy.get("[data-cy=data-table-row-5]").within(() => {
        cy.contains(
          "Output is translated to french words using Neural Network"
        );
        cy.contains("true");
      });
    });
  });

  it("summary has notebook button visible", () => {
    cyMockExecuteResponse<CodeExecutorResponseData>(cy, {
      responses: [
        {
          resData: executeNmtRes(),
          statusCode: 200,
        },
      ],
    });
    initActivity(cy);
    replaceModelCellWithCode(cy, complete, 0);
    cy.get("[data-cy=save-btn]").click();
    cy.get("[data-cy=view-sum-btn]").click();
    cy.get("[data-cy=notebook-btn]").should("exist");
    cy.get("[data-cy=simulator-btn]").should("not.exist");
  });
});
