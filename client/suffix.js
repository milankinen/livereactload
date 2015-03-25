'use strict';

module.exports = function(file, mod) {
  var makeHot = window.__reactloadify.makeHot
  makeExportsHot(mod, require('react'), file, makeHot)
}


function makeExportsHot(m, React, filename, makeHot) {
  if (isReactElementish(m.exports)) {
    // React elements are never valid React classes
    return false;
  }

  var freshExports = m.exports,
      exportsReactClass = isReactClassish(m.exports, React),
      foundReactClasses = false;

  if (exportsReactClass) {
    m.exports = makeHot(m.exports, filename + '__MODULE_EXPORTS');
    foundReactClasses = true;
  }

  for (var key in m.exports) {
    if (!Object.prototype.hasOwnProperty.call(freshExports, key)) {
      continue;
    }

    if (exportsReactClass && key === 'type') {
      // React 0.12 also puts classes under `type` property for compat.
      // Skip to avoid updating twice.
      continue;
    }

    if (!isReactClassish(freshExports[key], React)) {
      continue;
    }

    if (Object.getOwnPropertyDescriptor(m.exports, key).writable) {
      m.exports[key] = makeHot(freshExports[key], '__MODULE_EXPORTS_' + key);
      foundReactClasses = true;
    } else {
      console.warn("Can't make class " + key + " hot reloadable due to being read-only. You can exclude files or directories (for example, /node_modules/) using 'exclude' option in loader configuration.");
    }
  }

  return foundReactClasses;
}

function hasRender(Class) {
  var prototype = Class.prototype;
  if (!prototype) {
    return false;
  }

  return typeof prototype.render === 'function';
}

function descendsFromReactComponent(Class, React) {
  if (!React.Component) {
    return false;
  }

  var Base = Object.getPrototypeOf(Class);
  while (Base) {
    if (Base === React.Component) {
      return true;
    }

    Base = Object.getPrototypeOf(Base);
  }

  return false;
}

function isReactClassish(Class, React) {
  if (typeof Class !== 'function') {
    return false;
  }

  // React 0.13
  if (hasRender(Class) || descendsFromReactComponent(Class, React)) {
    return true;
  }

  // React 0.12 and earlier
  if (Class.type && hasRender(Class.type)) {
    return true;
  }

  return false;
}

function isReactElementish(obj) {
  if (!obj) {
    return false;
  }

  return Object.prototype.toString.call(obj.props) === '[object Object]' &&
    isReactClassish(obj.type);
}
