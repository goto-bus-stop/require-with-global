var test = require('tape')
var makeRequire = require('../')

test('injects a global variable into all nested requires()', function (t) {
  t.plan(2)
  var r = makeRequire()
  t.on('end', r.remove)

  var expected = [0, 'deep']

  r('./files/main', {
    console: {
      log: function (v) {
        t.equal(v, expected.shift())
      }
    }
  })
})

test('does not inject global variable into other requires()', function (t) {
  t.plan(2)
  var r = makeRequire()
  t.on('end', r.remove)

  t.equal(r('./files/with-hello', { hello: 'beepboop' }), 'beepboop string')
  t.equal(require('./files/without-hello'), null)
})

test('prefers builtin modules over local deps', function (t) {
  t.plan(2)
  var r = makeRequire()
  t.on('end', r.remove)
  require('assert/').isCore = false

  t.equal(r('assert/').isCore, false)
  t.notEqual(r('assert').isCore, false)
})
