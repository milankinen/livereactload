# LiveReactload version changelog

## 0.5.0

* Add better monitoring support for bundle changes
* Add automatic React inner class detection
* Add ES6 class example


## 0.4.0

* Fix "Something went wrong with LiveReactload initialization" when reloading transiend LiveReactload dependencies #18 #25
* Add smoke tests that can be run with `npm test` (firefox and bash required) #15
* Tested React 0.12.2 support
* Fix broken Firefox reloading (bundle url detection)


## 0.3.0

* Fix crash when trying to require JSON documents
* Fix Windows path separator bug
* Support query parameters in bundle urls
* Add cache prevent parameter to the reloaded bundle url
* Fix max 5 reload agent limitation 


## 0.2.4

* Add global Browserify transformation support so that `livereactload` can be used with `react-bootstrap`
  and other libraries that use `react` as peerDependency 
