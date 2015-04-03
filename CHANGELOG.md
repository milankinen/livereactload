# LiveReactload version changelog

## 0.3.0

* Fix crash when trying to require JSON documents
* Fix Windows path separator bug
* Support query parameters in bundle urls
* Add cache prevent parameter to the reloaded bundle url
* Fix max 5 reload agent limitation 


## 0.2.4

* Add global Browserify transformation support so that `livereactload` can be used with `react-bootstrap`
  and other libraries that use `react` as peerDependency 
