var pirates = require('pirates')
var debug = require('debug')('require-with-global')

var id = 0
module.exports = function withGlobal (require, globals) {
  var globalStateName = '__requireWithGlobalData' + id++
  var data = {
    makeRequire: makeRequire,
    values: Object.keys(globals).map(function (n) { return globals[n] })
  }
  var filenames = new Set()

  Object.defineProperty(global, globalStateName, {
    configurable: true, // should be deletable
    value: data
  })

  function shouldInject (filename) {
    return filenames.has(filename)
  }

  function makeRequire (parentName, require) {
    return Object.assign(function subrequire (id) {
      if (!global[globalStateName]) {
        throw new Error(
          'require-with-global\'s hooks were removed, but tried to require(' + JSON.stringify(id) + ')' +
          (parentName ? ' from ' + parentName : ''))
      }
      debug('requiring with global', id)
      var filename = require.resolve(id)
      filenames.add(filename)

      return require(filename)
    }, require)
  }

  // The wrapper that injects globals
  var pre = '(function(require,' + Object.keys(globals).join(',') + '){'
  var post = '\n}).apply(this,[' + globalStateName + '.makeRequire(module.filename,require)].concat(' + globalStateName + '.values));'

  var revert = pirates.addHook(function (code, filename) {
    debug('adding globals to', filename)
    return pre + code + post
  }, { exts: ['.js'], matcher: shouldInject, ignoreNodeModules: false })

  var api = makeRequire(null, require)
  api.remove = function () {
    revert()
    delete global[globalStateName]
  }
  return api
}
