exports.tokenize = tokenizeParagraph
exports.resolve = resolveParagraph

var assert = require('assert')
var characters = require('../../util/characters')
var core = require('../../core')

function tokenizeParagraph(effects, ok) {
  return start

  function start(code) {
    assert(
      code !== characters.eof &&
        code !== characters.cr &&
        code !== characters.lf &&
        code !== characters.crlf,
      'expected anything other than EOF, EOL'
    )
    effects.enter('paragraph')
    return data(code)
  }

  function data(code) {
    if (code === characters.eof) {
      effects.exit('paragraph')
      return ok(code)
    }

    // Data.
    effects.consume(code)
    return data
  }
}

function resolveParagraph(events) {
  var content = events[0][1]
  var tokenizer = core.text(content.start)

  return [].concat(
    events.slice(0, 1),
    events[0][2].sliceStream(content).concat(null).flatMap(tokenizer),
    events.slice(-1)
  )
}