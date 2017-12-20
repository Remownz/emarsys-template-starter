const fs = require('fs-extra');
const path = require('path');
const inlineCss = require('inline-css');
const paths = require('./paths');

const templates = filter(fs.readdirSync(paths.appTemplates), function(f) {
  return f.match(/\.twig/) && !f.match(/index\.twig/);
});
