module.exports = {
  testPathIgnorePatterns: ["/node_modules/", ".tmp", ".cache"],
  testEnvironment: "node",
  setupFilesAfterEnv: ["./jest.setup.js"],
  globals: {
    strapi: null,
  },
  // globalSetup: "./jest.global-setup.js",
  // globalTeardown: "./jest.global-teardown.js"
};
