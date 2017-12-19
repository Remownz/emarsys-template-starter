'use strict';
const fs = require('fs-extra');
const filter = require('lodash.filter');
const twig = require('twig');
const path = require('path');
const read = require('read-file');

const templatesBasePath = 'src/templates';
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

let server;

const paths = {
    appPublic: resolveApp('public'),
    appTemplates: resolveApp('src/templates'),
    appIndexTemplate: resolveApp('src/templates/index.twig'),
    appIndex: resolveApp('public/index.html')
};

function init(serverCallback) {

    server = serverCallback;

    const templates = filter(fs.readdirSync(templatesBasePath), function (f) {
        return f.match(/\.twig/) && !f.match(/index\.twig/)
    });


    generateIndex(templates.map(t => path.basename(t, '.twig')))
}

function generateIndex(indexFiles) {
    twig.renderFile(paths.appIndexTemplate, { indexFiles: indexFiles }, (err, html) => {
        fs.writeFile(paths.appIndex, html, server);
    });

    //console.log(indexFiles)
}


module.exports = {
    init: init
};

