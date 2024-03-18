/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  cyMockDefault,
  cyMockExecuteResponse,
  replaceModelCellWithCode,
} from "../support/functions";

import { CodeExecutorResponseData } from "../support/types";
import {
  complete,
  useLogisticRegression,
  useStemming,
} from "../fixtures/cafe/code-inputs";
import { executeCafeRes } from "../fixtures/cafe/execute-cafe-res";

function initActivity(cy) {
  cyMockDefault(cy);
  cy.visit("/?activity=cafe");
  // Currently have to wait for jupyter notebooks to load
  // TODO: remove timeout once we no longer use jupyter labs
  cy.get("[data-cy=okay-btn]", { timeout: 8000 }).click();
}

describe("cafe notebook", () => {
  it("hints displayed properly", () => {
    initActivity(cy);
    cy.get("[data-cy=hint-btn]").trigger("mouseover").click();
    cy.contains(
      "You are currently using a dummy classifier model, try a real one! (Naive Bayes, Logistic Regression, etc.)"
    );

    replaceModelCellWithCode(cy, useLogisticRegression);
    cy.get("[data-cy=hint-btn]").trigger("mouseover").click();
    cy.contains("Consider preprocessing your data with stemming!");
    replaceModelCellWithCode(cy, useStemming);
    cy.get("[data-cy=hint-btn]").trigger("mouseover").click();
    cy.contains("Try removing stopwords.");
    replaceModelCellWithCode(cy, complete);
    cy.get("[data-cy=hint-btn]").trigger("mouseover").click();
    cy.contains(
      "Your classifier is working very well! Do you want to submit this or keep playing with it?"
    );
  });

  it("summary shows training instances and statistics", () => {
    cyMockExecuteResponse<CodeExecutorResponseData>(cy, {
      responses: [
        {
          resData: executeCafeRes(),
          statusCode: 200,
        },
      ],
    });
    initActivity(cy);
    replaceModelCellWithCode(cy, complete);
    cy.get("[data-cy=save-btn]").click();
    cy.get("[data-cy=view-sum-btn]").click();
    cy.get("[data-cy=current-experiment-container]").within(() => {
      cy.get("[data-cy=data-table-row-0]").within(() => {
        cy.contains("Train Instances");
        cy.contains("750");
      });
      cy.get("[data-cy=data-table-row-1]").within(() => {
        cy.contains("Test Instances");
        cy.contains("250");
      });
      cy.get("[data-cy=data-table-row-5]").within(() => {
        cy.contains("F1 Score");
        cy.contains("46%");
      });
    });
  });

  it("summary has notebook and simulator button visible", () => {
    cyMockExecuteResponse<CodeExecutorResponseData>(cy, {
      responses: [
        {
          resData: executeCafeRes(),
          statusCode: 200,
        },
      ],
    });
    initActivity(cy);
    replaceModelCellWithCode(cy, complete);
    cy.get("[data-cy=save-btn]").click();
    cy.get("[data-cy=view-sum-btn]").click();
    cy.get("[data-cy=notebook-btn]").should("exist");
    cy.get("[data-cy=simulator-btn]").should("exist");
  });
});
