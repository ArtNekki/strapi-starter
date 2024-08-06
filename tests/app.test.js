const fs = require("fs");

it("strapi is defined", () => {
  expect(strapi).toBeDefined();
});

require("./hello");
