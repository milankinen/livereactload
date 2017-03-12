const exec = require('child_process').exec;
const pkg = require('../package.json');

module.exports = () => {
  exec(`cd public && http-server -p ${pkg.devPort}`, err => {
    if (err) {
      throw err;
    }
  });
};
