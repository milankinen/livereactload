# Private React components with LiveReactload

In LiveReactload version `0.5.0`, automatic detection of private React
classes was introduced. This means that if you create your React classes
with `React.createClass` method, then they are automatically detected
by LiveReactload. No `livereactload-api` needed anymore!

Note that LiveReactload does not support automatic private class exposing of
ES6 classes so only exported ES6 classes are live reloadable. If you want
to enable live reloading of your private ES6, you must use `expose` method from
[LiveReactload API](https://www.npmjs.com/package/livereactload-api).

```javascript
var lrAPI = require('livereactload-api')

class MyClass extends React.Component {
  ...
}

MyClass = lrAPI.expose(MyClass, 'MyClass')
```
