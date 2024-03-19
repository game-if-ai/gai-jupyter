/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  largeSixty,
  mediumSixty,
  mediumThirty,
  smallSixty,
  smallThirty,
} from "../fixtures/planes-tanks-automobiles/code-inputs";
import { executePlaneRes } from "../fixtures/planes-tanks-automobiles/execute-planes-res";
import {
  clickHintButton,
  cyMockDefault,
  cyMockExecuteResponse,
  replaceModelCellWithCode,
} from "../support/functions";

import { CodeExecutorResponseData } from "../support/types";

function initActivity(cy) {
  cyMockDefault(cy);
  cy.clearLocalStorage();
  indexedDB.deleteDatabase("history-db");
  cy.visit("/?activity=planes");
  // Currently have to wait for jupyter notebooks to load
  // TODO: remove timeout once we no longer use jupyter labs
  cy.get("[data-cy=okay-btn]", { timeout: 8000 }).click();
}

function runAndCloseSummary(cy) {
  cy.get("[data-cy=save-btn]").click();
  cy.wait(3000);
  cy.get("body").click(100, 100); // click off layover to close
}

describe("cafe notebook", () => {
  it("hints displayed properly", () => {
    cyMockExecuteResponse<CodeExecutorResponseData>(cy, {
      responses: [
        {
          resData: executePlaneRes(),
          statusCode: 200,
        },
      ],
    });
    initActivity(cy);
    clickHintButton(cy);
    cy.contains(
      "Seems to still be improving. Maybe try training for 60 epochs."
    );

    replaceModelCellWithCode(cy, smallSixty);
    clickHintButton(cy);
    cy.contains("Please run your code to see how the small model performs.");
    runAndCloseSummary(cy);
    clickHintButton(cy);
    cy.contains("Model may be too small for further improvement.");
    replaceModelCellWithCode(cy, mediumSixty);
    clickHintButton(cy);
    cy.contains(
      "Pretty good results. You should try the large model to see if you can get better."
    );
    replaceModelCellWithCode(cy, largeSixty);
    clickHintButton(cy);
    cy.contains("Please run your code to see how the large model performs.");
    runAndCloseSummary(cy);
    clickHintButton(cy);
    cy.contains("Model may be too large given the size of the training data.");
    replaceModelCellWithCode(cy, mediumSixty);
    clickHintButton(cy);
    cy.contains(
      "This model seems the best fit given the size of the training set. You should submit your results."
    );
  });

  it("summary shows training instances and statistics", () => {
    cyMockExecuteResponse<CodeExecutorResponseData>(cy, {
      responses: [
        {
          resData: executePlaneRes(),
          statusCode: 200,
        },
      ],
    });
    initActivity(cy);
    replaceModelCellWithCode(cy, mediumSixty);
    cy.get("[data-cy=save-btn]").click();
    cy.get("[data-cy=view-sum-btn]").click();
    cy.get("[data-cy=current-experiment-container]").within(() => {
      cy.get("[data-cy=data-table-row-0]").within(() => {
        cy.contains("Train Instances");
        cy.contains("1500");
      });
      cy.get("[data-cy=data-table-row-1]").within(() => {
        cy.contains("Test Instances");
        cy.contains("300");
      });
      cy.get("[data-cy=data-table-row-3]").within(() => {
        cy.contains("F1 Score");
        cy.contains("87%");
      });
    });
  });

  it("summary has notebook and simulator button visible", () => {
    cyMockExecuteResponse<CodeExecutorResponseData>(cy, {
      responses: [
        {
          resData: executePlaneRes(),
          statusCode: 200,
        },
      ],
    });
    initActivity(cy);
    replaceModelCellWithCode(cy, mediumSixty);
    cy.get("[data-cy=save-btn]").click();
    cy.get("[data-cy=view-sum-btn]").click();
    cy.get("[data-cy=notebook-btn]").should("exist");
    cy.get("[data-cy=simulator-btn]").should("exist");
  });
});
