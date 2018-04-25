# require-with-global

inject a global variable into a module require() tree

[![npm][npm-image]][npm-url]
[![travis][travis-image]][travis-url]
[![standard][standard-image]][standard-url]

[npm-image]: https://img.shields.io/npm/v/require-with-global.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/require-with-global
[travis-image]: https://img.shields.io/travis/goto-bus-stop/require-with-global.svg?style=flat-square
[travis-url]: https://travis-ci.org/goto-bus-stop/require-with-global
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[standard-url]: http://npm.im/standard

## Install

```
npm install require-with-global
```

## Usage

```js
var withGlobal = require('require-with-global')
var uppercaseStream = require('through2')(function (chunk, enc, next) {
  next(null, chunk.toUpperCase())
})
var virtualConsole = require('console').Console(uppercaseStream)
var r = withGlobal()
// `console` in ./app.js and all child modules will be `virtualConsole`.
var app = r('./app', {
  console: virtualConsole
})

app.run()

uppercaseStream.pipe(process.stdout)

r.remove() // Remove the require hook
```

## API

### `req = withGlobal()`

Create a `require` function that can be used to inject module-global variables.

### `req(specifier, vars)`

Require the module at `specifier`, injecting `vars` into all its deeply required
modules. All the variables specified in the `vars` object will be available in
modules required using the `req` function. Calls to `require()` inside the
module will be wrapped so that `vars` are also recursively injected in
dependencies of the module.

### `req.remove()`

Remove the compile hooks and global state that `withGlobal` uses to inject
variables into modules.

Note that globals that were already injected will continue to work; it's
perfectly safe to call `req.remove()` immediately after requiring some modules,
if you are certain that there are no lazy require() calls left.

## License

[Apache-2.0](LICENSE.md)
