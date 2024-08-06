const Strapi = require("@strapi/strapi");
const fs = require("fs");

let instance;

async function setupStrapi() {
  if (!instance) {
    await Strapi().load();
    instance = strapi;
    await instance.server.mount();
  }
  return instance;
}

global.setupStrapi = setupStrapi;

global.strapi = null;

beforeAll(async () => {
  await setupStrapi();
  global.strapi = instance;
});

afterAll(async () => {
  const dbSettings = strapi.config.get("database.connection");

  // close server to release the db-file
  await strapi.server.httpServer.close();

  // close the connection to the database before deletion
  await strapi.db.connection.destroy();

  // delete test database after all tests have completed
  if (dbSettings && dbSettings.connection && dbSettings.connection.filename) {
    const tmpDbFile = dbSettings.connection.filename;
    if (fs.existsSync(tmpDbFile)) {
      fs.unlinkSync(tmpDbFile);
    }
  }

  // Clear the instance
  instance = null;
  global.strapi = null;
});
