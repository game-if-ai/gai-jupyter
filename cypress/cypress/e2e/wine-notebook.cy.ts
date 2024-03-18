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

import {
  dropWine,
  dropWineWithAxis,
  dropQuality,
  saveQuality,
  useStandardScaler,
  fitsWithStandardScaler,
  transformsWithStandardScaler,
  complete,
  completeWithoutDroppingWine,
  completeWithFewClusters,
  completeWithTooManyClusters,
} from "../fixtures/wine/code-inputs";
import { executeWineRes } from "../fixtures/wine/execute-wine-complete-res";
import { CodeExecutorResponseData } from "../support/types";
import { executeWineResK1 } from "../fixtures/wine/execute-wine-complete-k-1";
import { executeWineResK9 } from "../fixtures/wine/execute-wine-complete-k-9";

function initActivity(cy) {
  cyMockDefault(cy);
  cy.visit("/?activity=wine");
  // Currently have to wait for jupyter notebooks to load
  // TODO: remove timeout once we no longer use jupyter labs
  cy.get("[data-cy=okay-btn]", { timeout: 8000 }).click();
}

describe("wine notebook", () => {
  it("hints displayed properly", () => {
    initActivity(cy);
    cy.get("[data-cy=hint-btn]").trigger("mouseover").click();
    cy.contains(
      "You need to drop the 'Wine' column because it isn't a useful feature."
    );

    replaceModelCellWithCode(cy, dropWine);
    cy.get("[data-cy=hint-btn]").trigger("mouseover").click();
    cy.contains(
      "In the drop method, you need to use the parameter setting 'axis=1' since you are dropping a column."
    );
    replaceModelCellWithCode(cy, dropWineWithAxis);
    cy.get("[data-cy=hint-btn]").trigger("mouseover").click();
    cy.contains(
      "You need to drop the 'quality' column to separate the labels from the data."
    );
    replaceModelCellWithCode(cy, dropQuality);
    cy.get("[data-cy=hint-btn]").trigger("mouseover").click();
    cy.contains("Are you saving the 'quality' column before dropping it?");
    replaceModelCellWithCode(cy, saveQuality);
    cy.get("[data-cy=hint-btn]").trigger("mouseover").click();
    replaceModelCellWithCode(cy, useStandardScaler);
    cy.get("[data-cy=hint-btn]").trigger("mouseover").click();
    cy.contains("You need to fit the StandardScaler to the data");
    replaceModelCellWithCode(cy, fitsWithStandardScaler);
    cy.get("[data-cy=hint-btn]").trigger("mouseover").click();
    cy.contains("You need to use the transform method to scale the data.");
    replaceModelCellWithCode(cy, transformsWithStandardScaler);
    cy.get("[data-cy=hint-btn]").trigger("mouseover").click();
    cy.contains(
      "The output of transform is an ndarray. You need to convert this"
    );
    replaceModelCellWithCode(cy, complete);
    cy.get("[data-cy=hint-btn]").trigger("mouseover").click();
    cy.contains("Everything looks good. Run your code to see how it performs.");
  });

  it("summary shows cluster members and quality", () => {
    cyMockExecuteResponse<CodeExecutorResponseData>(cy, {
      responses: [
        {
          resData: executeWineRes,
          statusCode: 200,
        },
      ],
    });
    initActivity(cy);
    replaceModelCellWithCode(cy, complete);
    cy.get("[data-cy=save-btn]").click();
    cy.get("[data-cy=view-sum-btn]").click();
    cy.get("[data-cy=current-experiment-container]").within(() => {
      cy.get("[data-cy=data-table-head]").contains("Cluster Size");
      cy.get("[data-cy=data-table-head]").contains("Quality");
      cy.get("[data-cy=data-table-row-0]").within(() => {
        cy.contains("321");
        cy.contains("5.308");
      });
    });
    cy.get("[data-cy=summary-tooltip]").contains("Good job!");
    cy.get("[data-cy=summary-tooltip]").contains(
      "You've separated the wine into a small number of groups varying in quality."
    );
  });

  it("summary notifies the user if their cluster size is too small or too big", () => {
    cyMockExecuteResponse<CodeExecutorResponseData>(cy, {
      responses: [
        {
          resData: executeWineResK1,
          statusCode: 200,
        },
        {
          resData: executeWineResK9,
          statusCode: 200,
        },
      ],
    });
    initActivity(cy);
    replaceModelCellWithCode(cy, completeWithFewClusters);
    cy.get("[data-cy=save-btn]").click();
    cy.get("[data-cy=view-sum-btn]").click();
    cy.get("[data-cy=summary-tooltip]").contains("Not enough clusters");
    cy.get("[data-cy=summary-tooltip]").contains(
      "Consider whether some of the clusters are getting too large."
    );
    cy.get("[data-cy=notebook-btn]").click();
    replaceModelCellWithCode(cy, completeWithTooManyClusters);
    cy.get("[data-cy=save-btn]").click();
    cy.get("[data-cy=view-sum-btn]").click();
    cy.get("[data-cy=summary-tooltip]").contains("Too many clusters");
    cy.get("[data-cy=summary-tooltip]").contains(
      "Consider whether some of the clusters are getting too small"
    );
  });

  it("summary tooltip shows leftover hints", () => {
    cyMockExecuteResponse<CodeExecutorResponseData>(cy, {
      responses: [
        {
          resData: executeWineRes,
          statusCode: 200,
        },
      ],
    });
    initActivity(cy);
    replaceModelCellWithCode(cy, completeWithoutDroppingWine);
    cy.get("[data-cy=save-btn]").click();
    cy.get("[data-cy=view-sum-btn]").click();
    cy.get("[data-cy=summary-tooltip]").contains("Feedback");
    cy.get("[data-cy=summary-tooltip]").contains(
      "You need to drop the 'Wine' column because it isn't a useful feature."
    );
  });
});
