/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
describe("select activity page", () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.wait(500);
  });

  it("shows activity picker step", () => {
    cy.visit("/");
    cy.get("[data-cy=root]").should("have.attr", "data-test", "0");
    cy.get("[data-cy=activity-picker-root]").should("exist");
    cy.get("[data-cy=notebook-root]").should("not.exist");
    cy.get("[data-cy=summary-root]").should("not.exist");
    cy.get("[data-cy=simulation-panel-root]").should("not.exist");
  });

  it("skips select activity step if activity in query params", () => {
    cy.visit("/?activity=cafe");
    cy.get("[data-cy=root]").should("have.attr", "data-test", "1");
    cy.get("[data-cy=activity-picker-root]").should("not.exist");
    cy.get("[data-cy=notebook-root]").should("exist");
    cy.get("[data-cy=summary-root]").should("not.exist");
    cy.get("[data-cy=simulation-panel-root]").should("not.exist");
  });

  it("does not skip select activity step if activity is invalid", () => {
    cy.visit("/?activity=none");
    cy.get("[data-cy=root]").should("have.attr", "data-test", "0");
    cy.get("[data-cy=activity-picker-root]").should("exist");
    cy.get("[data-cy=notebook-root]").should("not.exist");
    cy.get("[data-cy=summary-root]").should("not.exist");
    cy.get("[data-cy=simulation-panel-root]").should("not.exist");
  });

  it("picks a game activity from dropdown", () => {
    cy.visit("/");
    // shows options
    cy.get("[data-cy=select]").click();
    cy.get("[data-cy=neural_machine_translation]").should("exist");
    cy.get("[data-cy=fruitpicker]").should("exist");
    cy.get("[data-cy=cafe]").should("exist");
    cy.get("[data-cy=game-container]").children().should("have.length", 0); // don't show game
    cy.get("[data-cy=next-btn]").should("be.disabled"); // don't move on until game selected
    // select option
    cy.get("[data-cy=cafe]").trigger("mouseover").click();
    cy.get("[data-cy=game-container]").children().should("have.length", 1); // show game
    cy.get("[data-cy=next-btn]").should("not.be.disabled"); // enable button
  });

  it("picks a non-game activity from dropdown", () => {
    cy.visit("/");
    // shows options
    cy.get("[data-cy=select]").click();
    cy.get("[data-cy=neural_machine_translation]").should("exist");
    cy.get("[data-cy=fruitpicker]").should("exist");
    cy.get("[data-cy=cafe]").should("exist");
    cy.get("[data-cy=game-container]").children().should("have.length", 0); // don't show game
    cy.get("[data-cy=next-btn]").should("be.disabled"); // don't move on until game selected
    // select option
    cy.get("[data-cy=neural_machine_translation]").trigger("mouseover").click();
    cy.get("[data-cy=game-container]").children().should("have.length", 0); // no game to show
    cy.get("[data-cy=next-btn]").should("not.be.disabled"); // enable button
  });

  it("loads and shows phaser game", () => {
    cy.visit("/");
    // translation
    cy.get("[data-cy=select]").click();
    cy.get("[data-cy=neural_machine_translation]").trigger("mouseover").click();
    cy.wait(1000);
    cy.get("[data-cy=game-container]").matchImageSnapshot(
      `neural_machine_translation`
    );
    // cafe
    cy.get("[data-cy=select]").click();
    cy.get("[data-cy=cafe]").trigger("mouseover").click();
    cy.contains(
      "PAL the robot is sorting products based on customer feedback, and they need your help! Based on the review, should the product be Bought or Not? Train PAL's AI by completing a notebook to build a sentiment classifier."
    );
    cy.wait(2500);
    cy.get("[data-cy=game-container]").matchImageSnapshot(`cafe`);
    // fruitpicker
    cy.get("[data-cy=select]").click();
    cy.get("[data-cy=fruitpicker]").trigger("mouseover").click();
    cy.contains(
      "PAL the robot is gathering fruit for their picky human overlords, and they need your help! Train PAL's AI by building a classifier to select fruit based on their physical traits."
    );
    cy.wait(2500);
    cy.get("[data-cy=game-container]").matchImageSnapshot(`fruitpicker`);
  });

  it("navigates to cafe activity", () => {
    cy.visit("/");
    cy.get("[data-cy=select]").click();
    cy.get("[data-cy=cafe]").trigger("mouseover").click();
    cy.get("[data-cy=next-btn]").click();
    cy.wait(500);
    cy.get("[data-cy=root]").should("have.attr", "data-test", "1");
    cy.get("[data-cy=notebook-root]").should("exist");
    cy.contains("Bought or Not!");
    cy.contains(
      "Please complete this notebook to build a sentiment classifier. You will receive hints on how to improve its performance as you go."
    );
  });

  it("navigates to fruitpicker activity", () => {
    cy.visit("/");
    cy.get("[data-cy=select]").click();
    cy.get("[data-cy=fruitpicker]").trigger("mouseover").click();
    cy.get("[data-cy=next-btn]").click();
    cy.wait(500);
    cy.get("[data-cy=root]").should("have.attr", "data-test", "1");
    cy.get("[data-cy=notebook-root]").should("exist");
    cy.contains("Fruit Picker");
    cy.contains(
      "You are trying to build a classifier to select fruit based on their physical traits."
    );
  });

  it("navigates to translation activity", () => {
    cy.visit("/");
    cy.get("[data-cy=select]").click();
    cy.get("[data-cy=neural_machine_translation]").trigger("mouseover").click();
    cy.get("[data-cy=next-btn]").click();
    cy.wait(500);
    cy.get("[data-cy=root]").should("have.attr", "data-test", "1");
    cy.get("[data-cy=notebook-root]").should("exist");
    cy.contains("Neural Machine Translation");
    cy.contains(
      "Please finish this notebook to complete the English to French translator. You will receive hints as you go."
    );
  });
});
