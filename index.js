'use strict';

var plugin     = require('./lib/browserify/plugin'),
    listen     = require('./lib/server/listen'),
    notify     = require('./lib/server/notify'),
    gulpnofify = require('./lib/gulp/notify');

module.exports = plugin;

module.exports.listen = listen;
module.exports.notify = notify;
module.exports.gulpnotify = gulpnofify
