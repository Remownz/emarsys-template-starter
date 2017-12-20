'use strict';
const fs = require('fs-extra');
const filter = require('lodash.filter');
const twig = require('twig');
const path = require('path');
const read = require('read-file');
const chalk = require('chalk');
const paths = require('./paths');


function init(serverCallback) {
  const templates = filter(fs.readdirSync(paths.appTemplates), function(f) {
    return f.match(/\.twig/) && !f.match(/index\.twig/);
  });

  Promise.all(compileTemplates(templates, 'create')).then(
    values => {
      if (values.length) {
        Promise.resolve(
          generateIndex(
            values.map(t => {
              return {
                src: getTemplateBasename(t) + '.html',
                name: getTemplateBasename(t)
              };
            })
          )
        ).then(() => {
          console.log(
            chalk.green('All files created, starting development server...')
          );
          serverCallback();
        });
      } else {
        throw new Error('No Templates compiled!');
      }
    },
    error => {
      console.log(error);
    }
  );
}

function recompile(event, src) {
  compileTemplates([getTemplateBasename(src) + '.twig'], event);
}

function getTemplateBasename(t) {
  return path.basename(t, path.extname(t));
}

function compileTemplates(templates, event) {
  return templates.map(t => {
    return new Promise((resolve, reject) => {
      read(
        path.resolve(paths.appTemplates, getTemplateBasename(t) + '.twig'),
        'utf8',
        (error, buffer) => {
          if (!error) {
            const dataFile = path.resolve(
              paths.appTemplates,
              getTemplateBasename(t) + '.json'
            );
            let data = {};

            if (fs.existsSync(dataFile)) {
              data = fs.readFileSync(dataFile, 'utf8');
            }

            const twigTemplate = twig.twig({
              data: buffer
            });

            const output = twigTemplate.render(JSON.parse(data));

            resolve(
              writeTemplate(
                path.resolve(paths.appPublic, getTemplateBasename(t)) + '.html',
                output,
                event
              )
            );
          } else {
            console.log(error);
            reject(error);
          }
        }
      );
    });
  });
}

function writeTemplate(dest, content, event) {
  return new Promise((resolve, reject) => {
    fs.writeFile(dest, content, fileError => {
      if (fileError) {
        console.log(chalk.red(fileError));
        reject(fileError);
      } else {
        console.log(chalk.cyan(event + ' ' + dest));
        resolve(dest);
      }
    });
  });
}

function generateIndex(indexFiles) {
  return new Promise((resolve, reject) => {
    twig.renderFile(
      paths.appIndexTemplate,
      { indexFiles: indexFiles },
      (err, html) => {
        if (!err) {
          resolve(writeTemplate(paths.appIndex, html, 'create'));
        } else {
          reject(err);
        }
      }
    );
  });
}

module.exports = {
  init: init,
  recompile: recompile
};
