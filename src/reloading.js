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
    cache: {},
    reloading: false,
    reloadHooks: {}
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

  function compile(mapping) {
    var body = mapping[0];
    if (typeof body !== "function") {
      debug("Compiling module", mapping[2])
      var compiled = new Function("require", "module", "exports", body);
      mapping[0] = compiled;
      mapping[2].source = body;
    }
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
        compile(mapping);
        scope.mappings[id] = mapping;
        changes.push([id, old]);
      }
    });
    return changes;
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
    })

    var restoring = false;
    var modToReload = null;
    var traceModule = function (id) {
      if (options.debug) {
        modToReload = {
          id: id,
          deps: scope.mappings[id][1],
          meta: scope.mappings[id][2]
        };
      }
    };
    var evalLog = function () {
      !restoring && debug.apply(null, Array.prototype.slice.call(arguments));
    };

    scope.reloading = true;
    try {
      info("Applying changes...");
      debug("Changed modules", changedModules);
      debug("New modules", newMods);
      evaluate(entryId);
      info("Reload complete!");
    } catch (e) {
      console.error(e);
      error("Error occurred while reloading changes. Restoring old implementation...");
      debug("Module causing the error", modToReload);
      try {
        restoring = true;
        modToReload = null;
        restore();
        evaluate(entryId);
        info("Restored!");
      } catch (re) {
        console.error(re);
        error("Restore failed. You may need to refresh your browser... :-/");
        debug("Module causing the error", modToReload);
      }
    }
    scope.reloading = false;

    function evaluate(id) {
      evalLog("Evaluate module", id);
      if (!scope.mappings[id]) {
        evalLog("Module", id, "has no mappings in this bundle. Treating it as external module");
        return true;
      }

      var deps = vals(scope.mappings[id][1]).filter(isLocalModule);
      evalLog("Dependencies for", id, "-", deps);
      traceModule(id);
      var shouldStop = deps.map(evaluate)
      traceModule(id);

      if (all(shouldStop) && !contains(changedModules, id)) {
        return true;
      } else {
        var msg = contains(newMods, id) ? " > Add new module  ::" : " > Patch module    ::"
        console.log(msg, id);
        delete scope.cache[id];
        load(id);
        return allExportsProxies(id) || isAccepted(id);
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
          scope.mappings[id] = mapping;
        } else {
          delete scope.mappings[id];
        }
      })
    }
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
  Object.assign(scope, {
    compile: compile,
    load: load
  });

  debug("Options:", options);
  debug("Entries:", entryPoints, entryId);
  debug("Mappings")

  startClient();
  load(entryId);


  // this function is stringified in browserify process and appended to the bundle
  // so these helper functions must be inlined into this function, otherwise
  // the function is not working

  function isLocalModule(id) {
    return id.indexOf(options.nodeModulesRoot) === -1
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
      f = function (x) { return x; };
    }
    for (var i = 0; i < col.length; i++) {
      if (!f(col[i])) return false;
    }
    return true;
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
      console.log.apply(console, [ "LiveReactload [DEBUG] ::" ].concat(Array.prototype.slice.call(arguments)));
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

