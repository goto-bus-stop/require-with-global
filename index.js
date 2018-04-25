var path = require('path')
var assert = require('assert')
var pirates = require('pirates')
var resolve = require('resolve')
var callsites = require('callsites')
var isVarName = require('is-var-name')
var debug = require('debug')('require-with-global')

var id = 0
module.exports = function create () {
  var revert = pirates.addHook(function (code, filename) {
    var stateName = files.get(filename)
    var state = global[stateName]
    assert(state, 'require-with-global: could not find state object when requiring \'' + filename + '\'. ' +
                  'This is most likely a bug, please report at https://github.com/goto-bus-stop/require-with-global/issues.')

    debug('adding globals to', filename)
    // The wrapper that injects globals.
    var pre = '(function(' + state.keys.join(',') + '){'
    var post = '\n}).apply(this,global[' + JSON.stringify(stateName) + '].values);'

    return pre + code + post
  }, { exts: ['.js'], matcher: shouldInject, ignoreNodeModules: false })

  var files = new Map()

  function shouldInject (filename) {
    return files.has(filename)
  }

  function requireWithGlobal (filename, globals, caller) {
    if (!caller) caller = callsites()[1].getFileName()

    var basedir = path.dirname(caller)
    var fullpath = resolve.sync(filename, {
      basedir: basedir,
      extensions: Object.keys(require.extensions)
    })

    var injectVariables = Object.assign({}, globals, {
      // Wrap require to inject in child modules too.
      require: function (filename) {
        return requireWithGlobal(filename, globals, fullpath)
      }
    })
    var globalStateName = '__requireWithGlobalData' + id++
    var keys = Object.keys(injectVariables)
    var values = keys.map(function (k) { return injectVariables[k] })

    keys.forEach(function (key) {
      assert(isVarName(key), 'require-with-global: got invalid variable name: \'' + key + '\'')
    })

    // Tell the require hook where to find our state.
    files.set(fullpath, globalStateName)
    Object.defineProperty(global, globalStateName, {
      enumerable: false,
      writable: false,
      configurable: true, // should be deletable
      value: { keys: keys, values: values }
    })

    var result = require(fullpath)

    // Cleanup :v:
    files.delete(fullpath)
    delete global[globalStateName]

    return result
  }

  requireWithGlobal.remove = revert

  return requireWithGlobal
}
