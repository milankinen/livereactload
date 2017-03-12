# Flux with redux

LiveReactload supports all Flux implementations that are hot module reloadable, e.g. redux and ffux.

This example is copied from redux counter example and modified to use Browserify and LiveReactload instead of Webpack. A more complete version of this can be found here [redux-react-boilerplate](https://github.com/pixelass/redux-react-boilerplate). It includes css-modules, doc generation, browsersync and other features.

- [Developing](#developing)
  * [Examples](#examples)
- [What's included?](#whats-included)
  * [Libraries](#libraries)
  * [Transforms](#transforms)
  * [Coding style](#coding-style)
  * [Testing](#testing)
  * [Livereload](#livereload)

## Developing

To start a dev server and start developing try the following commands

* `start`: starts the dev server and builds the required files
* `test`: runs test and lints files
* `run dev`: starts the dev server and watches the required files
* `run babel`: generates lib from source
* `run build`: builds all files from source
* `run watch`: builds and watches all files from source
* `run lint`: lints javascript files

### Examples

**Starts a simple http-server**

```
npm start
```

**Starts a simple http-server and watches files**

```
npm run dev
```

## What's included?

### Libraries

* [Redux](http://redux.js.org/)
* [React](https://facebook.github.io/react/)


### Transforms

* [Babel](http://babeljs.io/)
  * [stage 0](http://babeljs.io/docs/plugins/preset-stage-0/)
  * [es2015](http://babeljs.io/docs/plugins/preset-es2015/)
  * [react](http://babeljs.io/docs/plugins/preset-react/)
* [Browserify](http://browserify.org/)

You can change the rules inside the `package.json` file.

* `babel`: `{<SETTINGS>}`
* `browserify`: `{<SETTINGS>}`

**defaults** (development settings needed for livereload)

```json
{
  "babel": {
    "presets": [
      "es2015",
      "stage-0",
      "react"
    ],
    "env": {
      "development": {
        "sourceMaps": "inline",
        "plugins": [
          [
            "react-transform",
            {
              "transforms": [
                {
                  "transform": "livereactload/babel-transform",
                  "imports": [
                    "react"
                  ]
                }
              ]
            }
          ]
        ]
      }
    }
  },
  "browserify": {
    "transform": [
      "babelify"
    ]
  }
}
```

### Coding style

* JS: [xo](https://github.com/sindresorhus/xo)

You can change the rules inside the `package.json` file.

* `xo`: `{<SETTINGS>}`

**defaults**

```json
{
  "xo": {
    "space": true,
    "semicolon": true
  }
}
```

### Testing

* [Ava](https://github.com/avajs/ava/)
* [Sinon](http://sinonjs.org/)
* [Coveralls](https://coveralls.io)
* [nyc]()

You can change the rules inside the `package.json` file.

* `ava`: `{<SETTINGS>}`
* `nyc`: `{<SETTINGS>}`

**defaults**

```json
{
  "ava": {
    "files": [
      "src/**/spec/*.js"
    ],
    "source": [
      "src/**/*.js"
    ],
    "presets": [
      "@ava/stage-4",
      "@ava/transform-test-files"
    ],
    "failFast": true,
    "tap": true,
    "require": [
      "babel-register"
    ],
    "babel": "inherit"
  },
  "nyc": {
    "exclude": [
      "src/store/**/*.js"
    ]
  }
}
```

### Livereload

* [livereactload](https://github.com/milankinen/livereactload/)
