# LiveReactload version changelog

## 2.x.x

**Everything rewritten**. Please 2.x.x release notes from
**[Github releases](https://github.com/milankinen/livereactload/releases)**.


## 0.7.0

* Upgrade `react-hot-api` version (solves #54)
* Drop React 0.12.x support (due to new `react-hot-api` version)
* Add notify port and reload port CLI options to `monitor` command 


## 0.6.0

* Add Grunt integration example #28
* Add support for local file:/// bundles #38
* Add config option to prevent cache busting #39
* Prevent multiple reload event sending at once #42
* Fix `SyntaxError` while reloading big bundles #35
* Update dependency versions


## 0.5.2

* Fix live reloading of `PureRenderMixin` components
* Make transform options optional (for Grunt)


## 0.5.1

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
