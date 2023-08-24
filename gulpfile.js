'use strict';

const path = require('path');

const projectDir = __dirname;
const tsconfigPath = path.join(projectDir, 'tools/gulp/tsconfig.json');

require('ts-node').register({
  project: tsconfigPath
});

require('./tools/gulp/gulpfile');