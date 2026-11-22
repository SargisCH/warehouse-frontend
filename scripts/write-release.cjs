const { writeFileSync } = require("node:fs");
const { join } = require("node:path");

const release = process.env.REACT_APP_RELEASE;

if (release) {
  const buildDirectory = process.env.BUILD_PATH || "build";
  writeFileSync(join(buildDirectory, "version.json"), JSON.stringify({ release }) + "\n");
}
