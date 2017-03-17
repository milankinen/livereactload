const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');
const Log = require('log');
const browserify = require('browserify');
const watchify = require('watchify');
const errorify = require('errorify');
const livereactload = require('livereactload');

const log = new Log('info');

const demoFolder = path.join(__dirname, '../site');
const buildFolder = path.join(__dirname, '../public');

// add or remove files from this list
// key: input file
// value: output name (used for css and js)
const fileMap = {
  'index.js': 'main'
};
// these files will be copied from the demoFolder to the buildFolder
const demoFiles = [
  'index.html',
  'favico.png'
];
const inputFiles = Object.keys(fileMap);

// bash command to remove files
const removeFiles = `rm -rf ${path.join(buildFolder, '*.{js,png,html}')}`;

module.exports = watch => {
  exec(removeFiles, err => {
    if (err) {
      throw err;
    }
    // bash command to copy files
    const copyFiles = demoFiles.map(file => `cp ${path.join(demoFolder, file)} ${path.join(buildFolder, file)}`).join(';');
    exec(copyFiles, err => {
      if (err) {
        throw err;
      }
    });

    // create a bundler for each file
    inputFiles.forEach(file => {
      const inFile = path.join(demoFolder, file);
      const outFile = path.join(buildFolder, fileMap[file]);
      const plugin = [errorify];

      if (watch) {
        plugin.push(watchify, livereactload);
      }

      const b = browserify({
        entries: [inFile],
        plugin
      });

      const bundle = () => {
        b.bundle().pipe(fs.createWriteStream(`${outFile}.js`));
      };

      // either uglify or watch
      if (watch) {
        b.on('update', bundle);
      } else {
        b.transform({
          global: true
        }, 'uglifyify');
      }

      b.on('log', message => log.info(message));
      b.on('error', message => log.error(message));

      bundle();
    });
  });
};
