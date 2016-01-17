# Basic LiveReactload 2.x usage with Babel 5.x

This example is identical to `01-basic-example` but it uses
Babel 5.x configurations instead.

Please see `.babelrc` and `package.json` for more details.

## Quickstart with Babel 5.x

Install pre-requirements (if not already exist)

```sh
npm i --save react
npm i --save-dev watchify babelify@6.x
```

**ATTENTION**: if you are using also `babel` package, remember it install it with `babel@5.x`!

Install React proxying components and LiveReactload

```sh
npm i --save-dev livereactload react-proxy@1.x babel-plugin-react-transform@1.1
```

Create `.babelrc` file into project's root directory (or add `react-transform` extra
if the file already exists). More information about `.babelrc` format and options
can be found from [babel-plugin-react-transform](https://github.com/gaearon/babel-plugin-react-transform).

```javascript
{
  "env": {
    "development": {
      "plugins": [
        "react-transform"
      ],
      "extra": {
        "react-transform": {
          "transforms": [{
            "transform": "livereactload/babel-transform",
            "imports": ["react"]
          }]
        }
      }
    }
  }
}
```

And finally use LiveReactload as a Browserify plugin with `watchify`. For example:

```bash
node_modules/.bin/watchify site.js -t babelify -p livereactload -o static/bundle.js
```
