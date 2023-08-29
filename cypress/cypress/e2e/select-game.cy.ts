/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
describe("select activity page", () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.visit("/");
  });

  it("shows activity picker component", () => {
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

  it("shows phaser game", () => {
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
    cy.wait(1000);
    cy.get("[data-cy=game-container]").matchImageSnapshot(`cafe`);
    // fruitpicker
    cy.get("[data-cy=select]").click();
    cy.get("[data-cy=fruitpicker]").trigger("mouseover").click();
    cy.wait(2500);
    cy.get("[data-cy=game-container]").matchImageSnapshot(`fruitpicker`);
  });

  it("navigates to cafe activity", () => {
    cy.get("[data-cy=select]").click();
    cy.get("[data-cy=cafe]").trigger("mouseover").click();
    cy.get("[data-cy=next-btn]").click();
    cy.get("[data-cy=root]").should("have.attr", "data-test", "1");
    cy.get("[data-cy=notebook-root]").should("exist");
    cy.contains("Bought or Not!");
  });

  it("navigates to fruitpicker activity", () => {
    cy.get("[data-cy=select]").click();
    cy.get("[data-cy=fruitpicker]").trigger("mouseover").click();
    cy.get("[data-cy=next-btn]").click();
    cy.get("[data-cy=root]").should("have.attr", "data-test", "1");
    cy.get("[data-cy=notebook-root]").should("exist");
    cy.contains("Fruit Picker");
  });

  it("navigates to translation activity", () => {
    cy.get("[data-cy=select]").click();
    cy.get("[data-cy=neural_machine_translation]").trigger("mouseover").click();
    cy.get("[data-cy=next-btn]").click();
    cy.get("[data-cy=root]").should("have.attr", "data-test", "1");
    cy.get("[data-cy=notebook-root]").should("exist");
    cy.contains("Neural Machine Translation");
  });
});
