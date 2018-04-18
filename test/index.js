var test = require('tape')
var withGlobal = require('../')

test('injects a global variable into all nested requires()', function (t) {
  t.plan(2)
  var expected = [0, 'deep']
  var r = withGlobal(require, {
    console: {
      log: function (v) {
        t.equal(v, expected.shift())
      }
    }
  })

  r('./files/main')
})

test('does not inject global variable into other requires()', function (t) {
  t.plan(2)
  var r = withGlobal(require, { hello: 'beepboop' })

  t.equal(r('./files/with-hello'), 'beepboop string')
  t.equal(require('./files/without-hello'), null)
})
