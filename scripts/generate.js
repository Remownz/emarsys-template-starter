'use strict';
const fs = require('fs-extra');
const filter = require('lodash.filter');
const twig = require('twig');
const path = require('path');
const read = require('read-file');
const chalk = require('chalk');

const templatesBasePath = 'src/templates';
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

const paths = {
  appPublic: resolveApp('public'),
  appTemplates: resolveApp('src/templates'),
  appIndexTemplate: resolveApp('src/templates/index.twig'),
  appIndex: resolveApp('public/index.html')
};

function init(serverCallback) {
  const templates = filter(fs.readdirSync(templatesBasePath), function (f) {
    return f.match(/\.twig/) && !f.match(/index\.twig/);
  });

  Promise.all(generateTemplates(templates)).then(values => {
    if(values.length){
      Promise.resolve(generateIndex((values.map(t => path.basename(t, '.html'))))).then(() => {
          console.log(chalk.green('All files created, starting development server...'));
          serverCallback();
      });
    } else {
      throw new Error('No Templates compiled!');
    }
  }, error => {
    console.log(error);
  })
}

function generateTemplates(templates) {
  return templates.map(t => {
    return new Promise((resolve, reject) => {
      twig.renderFile(path.resolve(paths.appTemplates, t), {}, (err, html) => {
        if (!err) {
          resolve(writeTemplate(path.resolve(paths.appPublic, path.basename(t, '.twig')) + '.html', html));
        } else {
          reject(err);
        }
      })
    })
  });
}

function writeTemplate(dest, content){
  return new Promise((resolve, reject) => {
    fs.writeFile(dest, content, fileError => {
      if (fileError) {
        console.log(chalk.red(fileError));
        reject(fileError);
      } else {
        console.log(chalk.cyan(dest + ' created'));
        resolve(dest);
      }
    });
  })

}

function generateIndex(indexFiles) {
  return new Promise((resolve, reject) => {
    twig.renderFile(
      paths.appIndexTemplate,
      { indexFiles: indexFiles },
      (err, html) => {
        if (!err) {
          resolve(writeTemplate(paths.appIndex, html));
        } else {
          reject(err);
        }
      }
    );
  });
}

module.exports = {
  init: init
};
