module.exports = require('@backstage/cli/config/eslint-factory')(__dirname, {
  // The TechDocs preview app is copied from Backstage's techdocs-cli embedded
  // app. It is type-checked by `yarn tsc` and tested by its e2e smoke test.
  ignorePatterns: ['preview-app/'],
});
