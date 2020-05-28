exports.tokenize = tokenizeIndentedCode
exports.resolve = resolveIndentedCode

var tab = 9 // '\t'
var lineFeed = 10 // '\n'
var space = 32 // ' '

var min = 4

function resolveIndentedCode(events) {
  var head = events[0]
  var tailIndex = events.length - 1
  var tailToken
  var code

  while (tailIndex !== 0) {
    tailToken = events[tailIndex][1]

    if (tailToken.type === 'codeLineFeed') {
      tailToken.type = 'lineFeed'
    } else if (
      tailToken.type !== 'lineFeed' &&
      tailToken.type !== 'linePrefix'
    ) {
      break
    }

    tailIndex--
  }

  code = {
    type: 'indentedCode',
    start: head[1].start,
    end: events[tailIndex][1].end
  }

  return [].concat(
    [['enter', code, head[2]]],
    events.slice(0, tailIndex + 1),
    [['exit', code, head[2]]],
    events.slice(tailIndex + 1)
  )
}

function tokenizeIndentedCode(effects, ok, nok) {
  var valid = false
  var size

  return start

  function start(code) {
    /* istanbul ignore next - used when hooking into multiple characters */
    if (code !== space && code !== tab) {
      return nok(code)
    }

    return lineStart(code)
  }

  function lineStart(code) {
    if (code === space || code === tab) {
      size = 0
      effects.enter('linePrefix')
      return linePrefix(code)
    }

    if (code !== code || code === lineFeed) {
      return lineEnd(code)
    }

    return end(code)
  }

  function linePrefix(code) {
    var prefix = size < min

    // Not enough indent yet.
    if (prefix === true && (code === tab || code === space)) {
      /* istanbul ignore next - todo: tabs. */
      size += code === space ? 1 : 4
      effects.consume(code)
      return linePrefix
    }

    effects.exit('linePrefix')
    size = undefined

    if (code !== code || code === lineFeed) {
      return lineEnd(code)
    }

    if (prefix === true) {
      return end(code)
    }

    effects.enter('codeLineData')
    return content(code)
  }

  function content(code) {
    if (code !== code || code === lineFeed) {
      effects.exit('codeLineData')
      return lineEnd(code)
    }

    // Mark as valid if this is a non-whitespace.
    if (valid === false && code !== space && code !== tab) {
      valid = true
    }

    effects.consume(code)
    return content
  }

  function lineEnd(code) {
    if (code !== code) {
      return end(code)
    }

    /* istanbul ignore next - used only for EOF and EOL. */
    if (code !== lineFeed) {
      throw new Error('Expected EOL or EOF')
    }

    effects.enter('codeLineFeed')
    effects.consume(code)
    effects.exit('codeLineFeed')
    return lineStart
  }

  function end(code) {
    return (valid === true ? ok : nok)(code)
  }
}