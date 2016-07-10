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
export default function loader(mappings, entryPoints, options) {
  if (window.$$LiveReactLoad) {
    throw new Error(
      "Trying to use more than one LiveReactLoad bundle. " +
      "Currently only one bundle is supported but if you can't " +
      "live with it, please raise an issue: " +
      "https://github.com/milankinen/livereactload/issues"
    );
  }
  // external require (if any)
  var _require = typeof require == "function" && require;

  if (entryPoints.length > 1) {
    throw new Error(
      "LiveReactLoad supports only one entry point at the moment"
    )
  }

  var entryId = entryPoints[0];

  var scope = window.$$LiveReactLoad = {
    mappings: mappings,
    cache: {},
    reloading: false
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
      const msg = JSON.parse(m.data);
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
      var compiled = new Function("require", "module", "exports", body);
      mapping[0] = compiled;
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
        if (!recur && req) return req(id, true);
        if (_require) return _require(id, true);
        var error = new Error("Cannot find module '" + id + "'");
        error.code = "MODULE_NOT_FOUND";
        throw error;
      }

      var module = cache[id] = {
        // normal browserify stuff
        exports: {},
        // reloading stuff
        __accepted: undefined,
        onReload: function onReload(callback) {
          if (scope.reloading) {
            var accepted = !!callback();
            this.__accepted = accepted;
          }
        }
      };

      mappings[id][0].call(module.exports, function require(path) {
        var targetId = mappings[id][1][path];
        return load(targetId ? targetId : path);
      }, module, module.exports, unknownUseCase, mappings, cache, entryPoints);
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

    scope.reloading = true;
    try {
      info("Applying changes...");
      evaluate(entryId);
      info("Reload complete!");
    } catch (e) {
      console.error(e);
      error("Error occurred while reloading changes. Restoring old implementation...");
      try {
        restore();
        evaluate(entryId);
      } catch (re) {
        console.error(re);
        error("Restore failed. You may need to refresh your browser... :-/");
      }
    }
    scope.reloading = false;


    function evaluate(id) {
      var deps = vals(scope.mappings[id][1]).filter(isLocalModule);
      var shouldStop = deps.map(evaluate)
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
        return x && !!x.__reactPatchProxy;
      }
    }

    function isAccepted(id) {
      var accepted = scope.cache[id].__accepted;
      scope.cache[id].__accepted = undefined;
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

  function info(msg) {
    console.info("LiveReactload ::", msg)
  }

  function warn(msg) {
    console.warn("LiveReactload ::", msg)
  }

  function error(msg) {
    console.error("LiveReactload ::", msg)
  }
}


