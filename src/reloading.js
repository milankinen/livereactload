/*eslint semi: "error"*/

/**
 * This is modified version of Browserify's original module loader function,
 * made to support LiveReactLoad's reloading functionality.
 *
 *
 * @param mappings
 *    An object containing modules and their metadata, created by
 *    LiveReactLoad plugin. The structure of the mappings object is:
 *    {
 *      [module_id]: [
 *        "...module_source...",
 *        {
 *          "module": target_id,
 *          "./another/module": target_id,
 *          ...
 *        },
 *        {
 *          hash: "md5_hash_from_source",
 *          isEntry: true|false
 *        }
 *      ],
 *      ...
 *    }
 *
 * @param entryPoints
 *    List of bundle's entry point ids. At the moment, only one entry point
 *    is supported by LiveReactLoad
 * @param options
 *    LiveReactLoad options passed from the CLI/plugin params
 */
function loader(mappings, entryPoints, options) {

  if (entryPoints.length > 1) {
    throw new Error(
      "LiveReactLoad supports only one entry point at the moment"
    )
  }

  var entryId = entryPoints[0];

  var scope = {
    mappings: mappings,
    revNums: {},
    cache: {},
    reloading: false,
    reloadHooks: {},
    reload: function (fn) {
      scope.reloading = true;
      try {
        fn();
      } finally {
        scope.reloading = false;
      }
    }
  };


  function startClient() {
    if (!options.clientEnabled) {
      return;
    }
    if (typeof window.WebSocket === "undefined") {
      warn("WebSocket API not available, reloading is disabled");
      return;
    }
    var protocol = window.location.protocol === "https:" ? "wss" : "ws";
    var url = protocol + "://" + (options.host || window.location.hostname) + ":" + options.port;
    var ws = new WebSocket(url);
    ws.onopen = function () {
      info("WebSocket client listening for changes...");
    };
    ws.onmessage = function (m) {
      var msg = JSON.parse(m.data);
      if (msg.type === "change") {
        handleBundleChange(msg.data);
      } else if (msg.type === "bundle_error") {
        handleBundleError(msg.data);
      }
    }
  }

  function compile(mapping, revision) {
    var body = mapping[0];
    if (typeof body !== "function") {
      debug("Compiling module", mapping[2], "[revision " + revision + " ]")
      var compiled = compileModule(body, mapping[2].sourcemap);
      mapping[0] = compiled;
      mapping[2].source = body;
    }
  }

  function compileModule(source, sourcemap) {
    var toModule = new Function(
      "__livereactload_source", "__livereactload_sourcemap",
      "return eval('function __livereactload_module(require, module, exports){\\n' + __livereactload_source + '\\n}; __livereactload_module;' + (__livereactload_sourcemap || ''));"
    );
    return toModule(source, sourcemap)
  }

  function unknownUseCase() {
    throw new Error(
      "Unknown use-case encountered! Please raise an issue: " +
      "https://github.com/milankinen/livereactload/issues"
    )
  }

  // returns loaded module from cache or if not found, then
  // loads it from the source and caches it
  function load(id, recur) {
    var mappings = scope.mappings;
    var cache = scope.cache;

    if (!cache[id]) {
      if (!mappings[id]) {
        var req = typeof require == "function" && require;
        if (req) return req(id);
        var error = new Error("Cannot find module '" + id + "'");
        error.code = "MODULE_NOT_FOUND";
        throw error;
      }

      var hook = scope.reloadHooks[id];
      var module = cache[id] = {
        exports: {},
        __accepted: false,
        onReload: function (hook) {
          scope.reloadHooks[id] = hook;
        }
      };

      mappings[id][0].call(module.exports, function require(path) {
        var targetId = mappings[id][1][path];
        return load(targetId ? targetId : path);
      }, module, module.exports, unknownUseCase, mappings, cache, entryPoints);

      if (scope.reloading && typeof hook === "function") {
        // it's important **not** to assign to module.__accepted because it would point
        // to the old module object during the reload event!
        cache[id].__accepted = hook()
      }

    }
    return cache[id].exports;
  }

  /**
   * Patches the existing modules with new sources and returns a list of changes
   * (module id and old mapping. ATTENTION: This function does not do any reloading yet.
   *
   * @param mappings
   *    New mappings
   * @returns {Array}
   *    List of changes
   */
  function patch(mappings) {
    var compile = scope.compile;
    var changes = [];

    keys(mappings).forEach(function (id) {
      var old = scope.mappings[id];
      var mapping = mappings[id];
      var meta = mapping[2];
      if (!old || old[2].hash !== meta.hash) {
        var rev = scope.revNums[id] ? ++scope.revNums[id] : (scope.revNums[id] = 1);
        if (old && meta.sourcemap) {
          addVersionToSourceMap(meta, rev);
        }
        compile(mapping, rev);
        scope.mappings[id] = mapping;
        changes.push([id, old]);
      }
    });
    return changes;

    // Updates the source map by adding a revision parameter to the filename.
    // Without this new filename, browsers will ignore the updated source map.
    function addVersionToSourceMap(meta, revision) {
      var comment = meta.sourcemap
        .replace(/^\/\*/g, '//')
        .replace(/\*\/$/g, '');
      // decode sourcemap comment and add hash param
      comment = comment.split(',').pop();
      var sourcemap = JSON.parse(atob(comment));
      for (var i = 0; i < sourcemap.sources.length; i++) {
        sourcemap.sources[i] += "?rev=" + revision;
      }
      // re-encode to sourcemap comment
      comment = btoa(JSON.stringify(sourcemap));
      comment = '//# sourceMappingURL=data:application/json;base64,' + comment;
      meta.sourcemap = comment;
    }
  }

  /**
   * Reloads modules based on the given changes. If reloading fails, this function
   * tries to restore old implementation.
   *
   * @param changes
   *    Changes array received from "patch" function
   */
  function reload(changes) {
    var changedModules = changes.map(function (c) {
      return c[0];
    });
    var newMods = changes.filter(function (c) {
      return !c[1];
    }).map(function (c) {
      return c[0];
    });

    scope.reload(function () {
      try {
        info("Applying changes...");
        debug("Changed modules", changedModules);
        debug("New modules", newMods);
        evaluate(entryId, {});
        info("Reload complete!");
      } catch (e) {
        error("Error occurred while reloading changes. Restoring old implementation...");
        console.error(e);
        console.error(e.stack);
        try {
          restore();
          evaluate(entryId, {});
          info("Restored!");
        } catch (re) {
          error("Restore failed. You may need to refresh your browser... :-/");
          console.error(re);
          console.error(re.stack);
        }
      }
    })


    function evaluate(id, changeCache) {
      if (id in changeCache) {
        debug("Circular dependency detected for module", id, "not traversing any further...");
        return changeCache[id];
      }
      if (isExternalModule(id)) {
        debug("Module", id, "is an external module. Do not reload");
        return false;
      }
      var module = getModule(id);
      debug("Evaluate module details", module);

      // initially mark change status to follow module's change status
      // TODO: how to propagate change status from children to this without causing infinite recursion?
      var meChanged = contains(changedModules, id);
      changeCache[id] = meChanged;
      if (id in scope.cache) {
        delete scope.cache[id];
      }

      var deps = module.deps.filter(isLocalModule);
      var depsChanged = deps.map(function (dep) {
        return evaluate(dep, changeCache);
      });

      // In the case of circular dependencies, the module evaluation stops because of the
      // changeCache check above. Also module cache should be clear. However, if some circular
      // dependency (or its descendant) gets reloaded, it (re)loads new version of this
      // module back to cache. That's why we need to ensure that we're not
      //    1) reloading module twice (so that we don't break cross-refs)
      //    2) reload any new version if there is no need for reloading
      //
      // Hence the complex "scope.cache" stuff...
      //
      var isReloaded = module.cached !== undefined && id in scope.cache;
      var depChanged = any(depsChanged);

      if (isReloaded || depChanged || meChanged) {
        debug("Module changed", id, isReloaded, depChanged, meChanged);
        if (!isReloaded) {
          var msg = contains(newMods, id) ? " > Add new module   ::" : " > Reload module    ::";
          console.log(msg, id);
          load(id);
        } else {
          console.log(" > Already reloaded ::", id);
        }
        changeCache[id] = !allExportsProxies(id) && !isAccepted(id);
        return changeCache[id];
      } else {
        // restore old version of the module
        if (module.cached !== undefined) {
          scope.cache[id] = module.cached;
        }
        return false;
      }
    }

    function allExportsProxies(id) {
      var e = scope.cache[id].exports;
      return isProxy(e) || (isPlainObj(e) && all(vals(e), isProxy));

      function isProxy(x) {
        return x && !!x.__$$LiveReactLoadable;
      }
    }

    function isAccepted(id) {
      var accepted = scope.cache[id].__accepted;
      scope.cache[id].__accepted = false;
      if (accepted === true) {
        console.log(" > Manually accepted")
      }
      return accepted === true;
    }

    function restore() {
      changes.forEach(function (c) {
        var id = c[0], mapping = c[1];
        if (mapping) {
          debug("Restore old mapping", id);
          scope.mappings[id] = mapping;
        } else {
          debug("Delete new mapping", id);
          delete scope.mappings[id];
        }
      })
    }
  }

  function getModule(id) {
    return {
      deps: vals(scope.mappings[id][1]),
      meta: scope.mappings[id][2],
      cached: scope.cache[id]
    };
  }

  function handleBundleChange(newMappings) {
    info("Bundle changed");
    var changes = patch(newMappings);
    if (changes.length > 0) {
      reload(changes);
    } else {
      info("Nothing to reload");
    }
  }

  function handleBundleError(data) {
    error("Bundling error occurred");
    error(data.error);
  }


  // prepare mappings before starting the app
  forEachValue(scope.mappings, compile);

  if (options.babel) {
    if (isReactTransformEnabled(scope.mappings)) {
        info("LiveReactLoad Babel transform detected. Ready to rock!");
    } else {
      warn(
        "Could not detect LiveReactLoad transform (livereactload/babel-transform). " +
        "Please see instructions how to setup the transform:\n\n" +
        "https://github.com/milankinen/livereactload#installation"
      );
    }
  }

  scope.compile = compile;
  scope.load = load;

  debug("Options:", options);
  debug("Entries:", entryPoints, entryId);

  startClient();
  // standalone bundles may need the exports from entry module
  return load(entryId);


  // this function is stringified in browserify process and appended to the bundle
  // so these helper functions must be inlined into this function, otherwise
  // the function is not working

  function isReactTransformEnabled(mappings) {
    return any(vals(mappings), function (mapping) {
      var source = mapping[2].source;
      return source && source.indexOf("__$$LiveReactLoadable") !== -1;
    });
  }

  function isLocalModule(id) {
    return id.indexOf(options.nodeModulesRoot) === -1
  }

  function isExternalModule(id) {
    return !(id in scope.mappings);
  }

  function keys(obj) {
    return obj ? Object.keys(obj) : [];
  }

  function vals(obj) {
    return keys(obj).map(function (key) {
      return obj[key];
    });
  }

  function contains(col, val) {
    for (var i = 0; i < col.length; i++) {
      if (col[i] === val) return true;
    }
    return false;
  }

  function all(col, f) {
    if (!f) {
      f = function (x) {
        return x;
      };
    }
    for (var i = 0; i < col.length; i++) {
      if (!f(col[i])) return false;
    }
    return true;
  }

  function any(col, f) {
    if (!f) {
      f = function (x) {
        return x;
      };
    }
    for (var i = 0; i < col.length; i++) {
      if (f(col[i])) return true;
    }
    return false;
  }

  function forEachValue(obj, fn) {
    keys(obj).forEach(function (key) {
      if (obj.hasOwnProperty(key)) {
        fn(obj[key]);
      }
    });
  }

  function isPlainObj(x) {
    return typeof x == 'object' && x.constructor == Object;
  }

  function debug() {
    if (options.debug) {
      console.log.apply(console, ["LiveReactload [DEBUG] ::"].concat(Array.prototype.slice.call(arguments)));
    }
  }

  function info(msg) {
    console.info("LiveReactload ::", msg);
  }

  function warn(msg) {
    console.warn("LiveReactload ::", msg);
  }

  function error(msg) {
    console.error("LiveReactload ::", msg);
  }
}

module.exports = loader;
module.exports["default"] = loader;

