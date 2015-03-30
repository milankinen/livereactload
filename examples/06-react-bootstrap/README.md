# Using react-bootstrap with LiveReactload

`react-bootstrap` uses `react` as a peer dependency. This means that
cached React instance must be injected to also to the react-bootstrap
module.

However, Browserify transforms are not applied to the global module. 
Fortunately it is possible to use transformers as **global transformers**
by using `-g` instead of `-t`.

This example shows how to use LiveReactload as a global transformer,
thus enabling the livereloadable usage of `react-bootstrap`.
