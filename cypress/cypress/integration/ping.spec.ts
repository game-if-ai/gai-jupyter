

describe("ping website", () =>{
    it("can visit website", ()=>{
        cy.visit("/");
    });
})