const fs = require('fs-extra');
const path = require('path');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

module.exports = {
  appPublic: resolveApp('public'),
  appTemplates: resolveApp('src/templates'),
  appIndexTemplate: resolveApp('src/templates/index.twig'),
  appIndex: resolveApp('public/index.html')
};
