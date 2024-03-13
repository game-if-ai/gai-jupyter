/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { executeCafeResNameError } from "../fixtures/execute-cafe-name-error";
import { executeCafeRes } from "../fixtures/execute-cafe-res";
import { executeWineRes } from "../fixtures/execute-wine-complete-res";
import { cyMockDefault, cyMockExecuteResponse } from "../support/functions";

describe("notebook", () => {
  beforeEach(() => {
    cyMockDefault(cy);
    cyMockExecuteResponse(cy, {
      resData: executeCafeRes(),
    });
    cy.visit("/?activity=cafe");
    // Currently have to wait for jupyter notebooks to load
    // TODO: remove timeout once we no longer use jupyter labs
    cy.get("[data-cy=okay-btn]", { timeout: 8000 }).click();
  });

  it("auto scrolls to model cell at start", () => {
    // cell dropdown selector is on Model
    cy.get("[data-cy=select]").contains("Model");
    // setup cell scrolled off so only the last line is visible
    cy.get("[data-cy=cell]")
      .eq(0)
      .within(($em) => {
        cy.get(".cm-line").should("have.length", 27);
        cy.get(".cm-line").eq(0).should("not.be.visible");
      });
    // model cell is showing
    cy.get("[data-cy=cell]")
      .eq(1)
      .within(($em) => {
        cy.get(".cm-line").should("have.length", 29);
        cy.get(".cm-line").eq(0).should("be.visible");
        cy.get(".cm-line").eq(28).should("be.visible");
      });
  });

  it("scrolls to setup cell via dropdown", () => {
    // cell dropdown selector is on Model by default
    cy.get("[data-cy=select]").contains("Model");
    // open dropdown
    cy.get("[data-cy=select]").click();
    cy.get("[data-cy=select-item]").eq(0).contains("Setup");
    cy.get("[data-cy=select-item]").eq(0).should("not.be.selected");
    cy.get("[data-cy=select-item]").eq(1).contains("Model");
    cy.get("[data-cy=select-item]").eq(1).should("be.selected");
    cy.get("[data-cy=select-item]").eq(2).contains("Validation");
    cy.get("[data-cy=select-item]").eq(2).should("not.be.selected");
    // select setup cell
    cy.get("[data-cy=select-item]").eq(0).click();
    cy.get("[data-cy=select]").contains("Setup");
    cy.get("[data-cy=cell]")
      .eq(0)
      .within(($em) => {
        cy.get(".cm-line").should("have.length", 27);
        cy.get(".cm-line").eq(0).should("be.visible");
        cy.get(".cm-line").eq(19).should("be.visible");
      });
    // model and output cell scrolled off
    cy.get("[data-cy=cell]")
      .eq(1)
      .within(($em) => {
        cy.get(".cm-line").should("have.length", 29);
        cy.get(".cm-line").eq(0).should("be.visible");
        cy.get(".cm-line").eq(28).should("not.be.visible");
      });
    cy.get("[data-cy=cell]")
      .eq(2)
      .within(($em) => {
        cy.get(".cm-line").eq(0).should("not.be.visible");
      });
  });

  it("scrolls to validation cell via dropdown", () => {
    // cell dropdown selector is on Model by default
    cy.get("[data-cy=select]").contains("Model");
    // open dropdown
    cy.get("[data-cy=select]").click();
    cy.get("[data-cy=select-item]").eq(0).contains("Setup");
    cy.get("[data-cy=select-item]").eq(0).should("not.be.selected");
    cy.get("[data-cy=select-item]").eq(1).contains("Model");
    cy.get("[data-cy=select-item]").eq(1).should("be.selected");
    cy.get("[data-cy=select-item]").eq(2).contains("Validation");
    cy.get("[data-cy=select-item]").eq(2).should("not.be.selected");
    // select validation cell
    cy.get("[data-cy=select-item]").eq(2).click();
    cy.get("[data-cy=select]").contains("Validation");
    cy.get("[data-cy=cell]")
      .eq(2)
      .within(($em) => {
        cy.get(".cm-line").should("have.length", 32);
        cy.get(".cm-line").eq(0).should("be.visible");
        cy.get(".cm-line").eq(31).should("be.visible");
      });
    // setup and model cell scrolled off
    cy.get("[data-cy=cell]")
      .eq(0)
      .within(($em) => {
        cy.get(".cm-line").should("have.length", 27);
        cy.get(".cm-line").eq(0).should("not.be.visible");
        cy.get(".cm-line").eq(19).should("not.be.visible");
      });
    cy.get("[data-cy=cell]")
      .eq(1)
      .within(($em) => {
        cy.get(".cm-line").should("have.length", 29);
        cy.get(".cm-line").eq(0).should("not.be.visible");
        cy.get(".cm-line").eq(28).should("be.visible");
      });
  });

  it("updates current cell in dropdown when scrolling manually", () => {
    cy.get("[data-cy=select]").contains("Model");
    cy.get("[data-cy=cells]").scrollTo("bottom");
    cy.get("[data-cy=select]").contains("Validation");
    cy.get("[data-cy=cells]").scrollTo("top");
    cy.get("[data-cy=select]").contains("Setup");
  });

  it("scrolls between cells when using up/down arrow", () => {
    cy.get("[data-cy=select]").contains("Model");
    cy.get("[data-cy=cell]")
      .eq(1)
      .within(($em) => {
        cy.get(".cm-line").eq(28).trigger("mouseover").click();
        cy.get(".cm-line").eq(28).type("{downArrow}");
      });
    cy.get("[data-cy=select]").contains("Validation");
    cy.get("[data-cy=cell]")
      .eq(2)
      .within(($em) => {
        cy.get(".cm-line").eq(0).trigger("mouseover").click();
        cy.get(".cm-line").eq(0).type("{upArrow}");
      });
    cy.get("[data-cy=select]").contains("Model");
    cy.get("[data-cy=cell]")
      .eq(1)
      .within(($em) => {
        cy.get(".cm-line").eq(0).trigger("mouseover").click();
        cy.get(".cm-line").eq(0).type("{upArrow}");
      });
    cy.get("[data-cy=select]").contains("Setup");
  });

  it("opens description", () => {
    cy.get("[data-cy=info-btn]").click();
    cy.contains("Bought or Not!");
    cy.contains(
      "Please complete this notebook to build a sentiment classifier. You will receive hints on how to improve its performance as you go."
    );
  });

  it("shows setup cell", () => {
    cy.get("[data-cy=cell]")
      .eq(0)
      .within(($em) => {
        // check edit features are disabled
        cy.get("[data-cy=undo-btn]").should("not.exist");
        cy.get("[data-cy=redo-btn]").should("not.exist");
        cy.get("[data-cy=hint-btn]").should("not.exist");
        cy.get("[data-cy=output-btn]").should(
          "have.attr",
          "data-test",
          "false"
        );
        // check code auto filled
        cy.get(".cm-line").contains("import pandas as pd");
        cy.get(".cm-line").contains("import nltk, json");
        cy.get(".cm-line").contains("import tempfile");
        cy.get(".cm-line").contains("from nltk.data import path");
        cy.get(".cm-line").contains(
          "result.append(json.dumps([len(x_train), len(x_test)]))"
        );
      });
  });

  it("shows model cell", () => {
    cy.get("[data-cy=cell]")
      .eq(1)
      .within(($em) => {
        // check edit features are enabled
        cy.get("[data-cy=undo-btn]").should("exist");
        cy.get("[data-cy=undo-btn]").should("be.disabled");
        cy.get("[data-cy=redo-btn]").should("exist");
        cy.get("[data-cy=redo-btn]").should("be.disabled");
        cy.get("[data-cy=hint-btn]").should("exist");
        cy.get("[data-cy=output-btn]").should("have.attr", "data-test", "true");
        // check code auto filled
        cy.get(".cm-line").contains(
          "from sklearn.dummy import DummyClassifier"
        );
        cy.get(".cm-line").contains(
          "from sklearn.feature_extraction.text import CountVectorizer"
        );
        cy.get(".cm-line").contains("# Preprocess First");
        cy.get(".cm-line").contains("def preprocess(docs):");
        cy.get(".cm-line").contains(`return docs.apply(lambda x: x)`);
        cy.get(".cm-line").contains(
          `train(classifier,x_train_features, y_train)`
        );
      });
  });

  it("shows validation cell", () => {
    cy.get("[data-cy=cell]")
      .eq(2)
      .within(($em) => {
        // check edit features are disabled
        cy.get("[data-cy=undo-btn]").should("not.exist");
        cy.get("[data-cy=redo-btn]").should("not.exist");
        cy.get("[data-cy=hint-btn]").should("not.exist");
        cy.get("[data-cy=output-btn]").should(
          "have.attr",
          "data-test",
          "false"
        );
        // check code auto filled
        cy.get(".cm-line").contains(
          "y_pred_test = classifier.predict(x_test_features)"
        );
        cy.get(".cm-line").contains(
          "y_proba = classifier.predict_proba(x_test_features)"
        );
        cy.get(".cm-line").contains("result.append(json.dumps(output))");
      });
  });

  it("can edit notebook", () => {
    cy.get("[data-cy=run-btn]").should("be.visible");
    cy.get("[data-cy=save-btn]").should("not.exist");
    // cannot edit setup cell
    cy.get("[data-cy=cell]")
      .eq(0)
      .within(($em) => {
        cy.get(".cm-line").eq(0).type("t");
        cy.get(".cm-line").eq(0).contains("import pandas as pd");
      });
    // cannot edit validation cell
    cy.get("[data-cy=cell]")
      .eq(2)
      .within(($em) => {
        cy.get(".cm-line").eq(0).type("t");
        cy.get(".cm-line")
          .eq(0)
          .contains("y_pred_test = classifier.predict(x_test_features)");
      });
    // can edit model cell
    cy.get("[data-cy=cell]")
      .eq(1)
      .within(($em) => {
        cy.get("[data-cy=undo-btn]").should("be.disabled");
        cy.get("[data-cy=redo-btn]").should("be.disabled");
        cy.get(".cm-line").eq(0).type("t");
        cy.get(".cm-line")
          .eq(0)
          .contains("from sklearn.dummy import DummyClassifiert");
        cy.get("[data-cy=undo-btn]").should("be.enabled");
        cy.get("[data-cy=redo-btn]").should("be.disabled");
      });
    cy.get("[data-cy=run-btn]").should("not.exist");
    cy.get("[data-cy=save-btn]").should("be.visible");
  });

  it("can undo and redo changes", () => {
    cy.get("[data-cy=cell]")
      .eq(1)
      .within(($em) => {
        cy.get("[data-cy=undo-btn]").should("be.disabled");
        cy.get("[data-cy=redo-btn]").should("be.disabled");
        cy.get(".cm-line").eq(0).type("t");
        cy.get(".cm-line")
          .eq(0)
          .contains("from sklearn.dummy import DummyClassifiert");
        cy.get("[data-cy=undo-btn]").should("be.enabled");
        cy.get("[data-cy=redo-btn]").should("be.disabled");
        // undo changes
        cy.get("[data-cy=undo-btn]").click();
        cy.get(".cm-line")
          .eq(0)
          .contains("from sklearn.dummy import DummyClassifier");
        cy.get("[data-cy=undo-btn]").should("be.disabled");
        cy.get("[data-cy=redo-btn]").should("be.enabled");
        // redo changes
        cy.get("[data-cy=redo-btn]").click();
        cy.get(".cm-line")
          .eq(0)
          .contains("from sklearn.dummy import DummyClassifiert");
        cy.get("[data-cy=undo-btn]").should("be.enabled");
        cy.get("[data-cy=redo-btn]").should("be.disabled");
      });
  });

  it("saves changes and views error", () => {
    cyMockExecuteResponse(cy, {
      resData: executeCafeResNameError,
    });
    cy.visit("/?activity=cafe");
    Cypress.config("defaultCommandTimeout", 10000);
    cy.wait(1000);
    cy.get("[data-cy=cell]")
      .eq(1)
      .within(($em) => {
        cy.get(".cm-line").eq(2).type("t", { delay: 500 });
        cy.get(".cm-line").eq(2).contains("t");
      });
    // saves and runs code
    cy.wait(1000);
    cy.get("[data-cy=save-btn]").click();
    cy.get("[data-cy=run-btn]").should("exist");
    cy.get("[data-cy=run-btn]").should("be.disabled");
    // shows error output
    cy.wait(2500);
    cy.contains(
      "Your code contains a naming error. You may be trying to use an undeclared variable or function."
    );
    cy.get("[data-cy=output]").contains("name 't' is not defined");
  });

  it("saves changes and views output", () => {
    cyMockExecuteResponse(cy, {
      resData: executeCafeRes("hi"),
    });
    cy.visit("/?activity=cafe");
    Cypress.config("defaultCommandTimeout", 10000);
    cy.wait(1000);
    cy.get("[data-cy=cell]")
      .eq(1)
      .within(($em) => {
        cy.get(".cm-line").eq(2).type(`print("hi")`, { delay: 500 });
      });
    // saves and runs code
    cy.wait(1000);
    cy.get("[data-cy=save-btn]").click();
    cy.get("[data-cy=run-btn]").should("exist");
    // show result popup (code ran correctly)
    cy.contains("See results");
    cy.contains("Would you like to view your results?");
    // show output
    cy.get("[data-cy=output]").contains("hi");
  });

  it("can run notebook", () => {
    cy.get("[data-cy=run-btn]").click();
    cy.get("[data-cy=run-btn]").should("not.be.visible");
    // show result popup
    cy.contains("See results");
    cy.contains("Would you like to view your results?");
  });

  it("views simulation after running", () => {
    cy.get("[data-cy=run-btn]").click();
    cy.get("[data-cy=view-sim-btn]").click();
    cy.get("[data-cy=root]").should("have.attr", "data-test", "2");
    cy.get("[data-cy=activity-picker-root]").should("not.exist");
    cy.get("[data-cy=notebook-root]").should("not.exist");
    cy.get("[data-cy=summary-root]").should("not.exist");
    cy.get("[data-cy=simulation-panel-root]").should("exist");
  });

  it("views summary after running", () => {
    cy.get("[data-cy=run-btn]").click();
    cy.get("[data-cy=view-sum-btn]").click();
    cy.get("[data-cy=root]").should("have.attr", "data-test", "3");
    cy.get("[data-cy=activity-picker-root]").should("not.exist");
    cy.get("[data-cy=notebook-root]").should("not.exist");
    cy.get("[data-cy=summary-root]").should("exist");
    cy.get("[data-cy=simulation-panel-root]").should("not.exist");
  });

  it("gives autocomplete options", () => {
    cy.get("[data-cy=select]").contains("Model");
    cy.get("[data-cy=cell]")
      .eq(1)
      .within(($em) => {
        cy.get(".cm-line").eq(2).type("sk", { delay: 500 });
        cy.get(".cm-line").eq(2).contains("sk");
        cy.get(".autocompleteOption")
          .eq(0)
          .contains("from sklearn.cluster import DBSCAN");
        cy.get(".autocompleteOption").eq(0).click();
        cy.get(".cm-line").eq(2).contains("from sklearn.cluster import DBSCAN");
      });
  });

  it("gives hints on code changes", () => {
    cy.get("[data-cy=select]").contains("Model");
    cy.get("[data-cy=cell]")
      .eq(1)
      .within(($em) => {
        cy.get("[data-cy=hint-btn]").trigger("mouseover").click();
      });
    cy.contains(
      "You are currently using a dummy classifier model, try a real one! (Naive Bayes, Logistic Regression, etc.)"
    );
    cy.get("[data-cy=cell]")
      .eq(1)
      .within(($em) => {
        cy.get(".cm-line").eq(0).type("{shift}{upArrow}{del}", { delay: 500 });
        cy.get(".cm-line").eq(0).type("sk", { delay: 500 });
        cy.get(".autocompleteOption")
          .eq(1)
          .contains("from sklearn.naive_bayes import MultinomialNB");
        cy.get(".autocompleteOption").eq(1).click();
        cy.get(".cm-line").eq(24).type("{shift}{upArrow}{del}", { delay: 500 });
        cy.get(".cm-line").eq(24).type("mu", { delay: 500 });
        cy.get(".autocompleteOption")
          .eq(1)
          .contains("classifier = MultinomialNB()");
        cy.get(".autocompleteOption").eq(1).click();
        cy.get("[data-cy=hint-btn]").trigger("mouseover").click();
      });
    cy.contains("Consider preprocessing your data with stemming!");
    cy.get("[data-cy=cell]")
      .eq(1)
      .within(($em) => {
        cy.get(".cm-line").eq(2).type("nl", { delay: 500 });
        cy.get(".autocompleteOption")
          .eq(2)
          .contains("from nltk.stem import WordNetLemmatizer");
        cy.get(".autocompleteOption").eq(1).click();
        cy.get(".cm-line").eq(10).type("wo", { delay: 500 });
        cy.get(".autocompleteOption")
          .eq(1)
          .contains("lemmatizer = WordNetLemmatizer()");
        cy.get(".autocompleteOption").eq(1).click();
        cy.get("[data-cy=hint-btn]").trigger("mouseover").click();
      });
    cy.contains("Consider giving the Naive Bayes model a try!");
  });
});
