/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
describe("notebook", () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.visit("/?activity=cafe");
    cy.get("[data-cy=okay-btn]").click();
  });

  it("auto scrolls to model cell at start", () => {
    // cell dropdown selector is on Model
    cy.get("[data-cy=select]").contains("Model");
    // setup cell scrolled off so only the last line is visible
    cy.get("[data-cy=cell]")
      .eq(0)
      .within(($em) => {
        cy.get(".cm-line").should("have.length", 20);
        cy.get(".cm-line").eq(0).should("not.be.visible");
        cy.get(".cm-line").eq(19).should("be.visible");
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
        cy.get(".cm-line").should("have.length", 20);
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
        cy.get(".cm-line").should("have.length", 33);
        cy.get(".cm-line").eq(0).should("be.visible");
        cy.get(".cm-line").eq(32).should("be.visible");
      });
    // setup and model cell scrolled off
    cy.get("[data-cy=cell]")
      .eq(0)
      .within(($em) => {
        cy.get(".cm-line").should("have.length", 20);
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
        cy.get(".cm-line").contains("from IPython.display import JSON");
        cy.get(".cm-line").contains("nltk.download('wordnet', quiet=True)");
        cy.get(".cm-line").contains(`nltk.download("stopwords", quiet=True)`);
        cy.get(".cm-line").contains(`REVIEW = "review"`);
        cy.get(".cm-line").contains("# use smaller set");
        cy.get(".cm-line").contains(`with open("cafe/reviews.json") as IN:`);
        cy.get(".cm-line").contains("data = pd.DataFrame(json.load(IN))");
        cy.get(".cm-line").contains(
          "from sklearn.model_selection import train_test_split"
        );
        cy.get(".cm-line").contains(
          "x_train, x_test, y_train, y_test = train_test_split(data[REVIEW],"
        );
        cy.get(".cm-line").contains("data['rating'],");
        cy.get(".cm-line").contains("stratify=data['rating'],");
        cy.get(".cm-line").contains("random_state=21)");
        cy.get(".cm-line").contains(
          "JSON([len(x_train) + len(y_train), len(x_test) + len(y_test)])"
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
        cy.get(".cm-line").contains(`x_train = preprocess(x_train)`);
        cy.get(".cm-line").contains("y_train = preprocess(y_train)");
        cy.get(".cm-line").contains("# Pick Vectorizer");
        cy.get(".cm-line").contains(
          `vectorizer = CountVectorizer(binary=True)`
        );
        cy.get(".cm-line").contains(
          "x_train_features = vectorizer.fit_transform(x_train)"
        );
        cy.get(".cm-line").contains(
          "x_test_features = vectorizer.transform(x_test)"
        );
        cy.get(".cm-line").contains("def train(classifier, x, y):");
        cy.get(".cm-line").contains("classifier.fit(x, y)");
        cy.get(".cm-line").contains("# Pick Classifier");
        cy.get(".cm-line").contains(
          `classifier = DummyClassifier(strategy="uniform")`
        );
        cy.get(".cm-line").contains("# Train");
        cy.get(".cm-line").contains(
          "train(classifier,x_train_features, y_train)"
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
        cy.get(".cm-line").contains("from sklearn.metrics import f1_score");
        cy.get(".cm-line").contains("from IPython.display import JSON");
        cy.get(".cm-line").contains(`output = []`);
        cy.get(".cm-line").contains(`x_test_list = x_test.to_list()`);
        cy.get(".cm-line").contains("y_test_list = y_test.to_list()");
        cy.get(".cm-line").contains("experiment_size = y_pred_test.size // 5");
        cy.get(".cm-line").contains(`trial = 0`);
        cy.get(".cm-line").contains("experiment = []");
        cy.get(".cm-line").contains("y_true = []");
        cy.get(".cm-line").contains("y_pred = []");
        cy.get(".cm-line").contains("f1_scores = []");
        cy.get(".cm-line").contains("for i in range(y_pred_test.size):");
        cy.get(".cm-line").contains(
          "if trial == experiment_size and i + experiment_size <= y_pred_test.size:"
        );
        cy.get(".cm-line").contains("output.append(experiment)");
        cy.get(".cm-line").contains("experiment = []");
        cy.get(".cm-line").contains("trial = 0");
        cy.get(".cm-line").contains(
          "f1_scores.append(f1_score(y_true, y_pred))"
        );
        cy.get(".cm-line").contains("y_true = []");
        cy.get(".cm-line").contains("y_pred = []");
        cy.get(".cm-line").contains("y_true.append(y_test_list[i])");
        cy.get(".cm-line").contains("y_pred.append(y_pred_test[i])");
        cy.get(".cm-line").contains("experiment.append({");
        cy.get(".cm-line").contains(`"inputText": x_test_list[i],`);
        cy.get(".cm-line").contains(`"realLabel": y_test_list[i],`);
        cy.get(".cm-line").contains(`"classifierLabel": y_pred_test[i],`);
        cy.get(".cm-line").contains(`"confidence": max(y_proba[i])`);
        cy.get(".cm-line").contains("trial += 1");
        cy.get(".cm-line").contains("JSON(output)");
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
    Cypress.config("defaultCommandTimeout", 10000);
    cy.get("[data-cy=cell]")
      .eq(1)
      .within(($em) => {
        cy.get(".cm-line").eq(0).clear();
        cy.get(".cm-line").eq(0).type("t");
        cy.get(".cm-line").eq(0).contains("t");
      });
    // saves and runs code
    cy.wait(1000);
    cy.get("[data-cy=save-btn]").click();
    cy.get("[data-cy=run-btn]").should("exist");
    cy.get("[data-cy=run-btn]").should("be.disabled");
    // shows error output
    cy.contains(
      "Your code contains a naming error. You may be trying to use an undeclared variable or function."
    );
    cy.get("[data-cy=output]").contains("name 't' is not defined");
  });

  it("saves changes and views output", () => {
    Cypress.config("defaultCommandTimeout", 10000);
    cy.get("[data-cy=cell]")
      .eq(1)
      .within(($em) => {
        cy.get(".cm-line").eq(2).type(`print("hi")`, { delay: 500 });
      });
    // saves and runs code
    cy.wait(1000);
    cy.get("[data-cy=save-btn]").click();
    cy.get("[data-cy=run-btn]").should("exist");
    cy.get("[data-cy=run-btn]").should("be.enabled");
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

  // todo: autocomplete

  // todo: hints
});
