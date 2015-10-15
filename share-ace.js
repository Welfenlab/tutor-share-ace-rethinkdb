;(function () {
  'use strict'

  // var requireImpl = ace.require != null ? ace.require : require

  var offsetToPos = function (editor, offset) {
    var line, lines, row, _i, _len

    lines = editor.getSession().getDocument().getAllLines()
    row = 0
    for (row = _i = 0, _len = lines.length; _i < _len; row = ++_i) {
      line = lines[row]
      if (offset <= line.length) {
        break
      }
      offset -= lines[row].length + 1
    }
    return {
      row: row,
      column: offset
    }
  }

  /**
   * @param editor - Ace instance
   * @param ctx - Share context
   */
  function shareAce (Range, editor, ctx) {
    if (!ctx.provides.text) throw new Error('Cannot attach to non-text document')

    var suppress = false
    var text = ctx.get() || ''; // Due to a bug in share - get() returns undefined for empty docs.
    editor.setValue(text)
    check()

    // *** remote -> local changes

    ctx.onInsert = function (pos, text) {
      editor.off('change', onLocalChange)
      suppress = true

      editor.getSession().insert(offsetToPos(editor, pos), text)
      suppress = false
      check()
      editor.on('change', onLocalChange)
    }

    ctx.onRemove = function (pos, length) {
      editor.off('change', onLocalChange)
      suppress = true
      var A = offsetToPos(editor, pos)
      var B = offsetToPos(editor, pos + length)
      var range = new Range.Range(
        A.row, A.column, B.row, B.column
      )
      editor.getSession().remove(range)
      suppress = false
      check()
      editor.on('change', onLocalChange)
    }

    // *** local -> remote changes

    editor.on('change', onLocalChange)

    function onLocalChange (change) {
      if (suppress) return true
      applyToShareJS(editor, change)
      check()
      return true
    }

    editor.detachShareJsDoc = function () {
      ctx.onRemove = null
      ctx.onInsert = null
      editor.off('change', onLocalChange)
    }

    // Convert a Ace change into an op understood by share.js
    function applyToShareJS (editor, change) {
      var startPos = 0;  // Get character position from # of chars in each line.
      var i = 0;         // i goes through all lines.

      // CANNOT use editor.getLines() because of bug *frown* !!11!elf
      // (or documentation error)
      var editorContent = editor.getValue().split('\n');

      for (var i = 0; i != change.start.row; ++i) {
        startPos += editorContent[i].length + 1;
      }
      startPos += change.start.column;

      switch (change.action) {
        case ('insert'): {
          var insertion = change.lines.join('\n');

          ctx.insert(startPos, insertion);
          break;
        }
        case ('remove'): {
          var delLen = 0;
          for (var p = 0; p != change.lines.length; ++p) {
            delLen += change.lines[p].length + 1;
          }
          delLen--;

          ctx.remove(startPos, delLen);
          break;
        }
      }
    }

    function check () {
      setTimeout(function () {
        var editorText, otText

        editorText = editor.getValue()
        otText = ctx.get() || ''

        if (editorText !== otText) {
          console.error('Text does not match!')
          console.error('editor: ' + editorText)
          return console.error('ot:     ' + otText)
        }
      }, 0)
    }

    return ctx
  }

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    // Node.js
    module.exports = shareAce
    module.exports.scriptsDir = __dirname
  } else {
    if (typeof define === 'function' && define.amd) {
      // AMD
      define([], function () {
        return shareAce
      })
    } else {
      // Browser, no AMD
      window.sharejs.Doc.prototype.attachAce = function (Range, editor, ctx) {
        if (!ctx) ctx = this.createContext()
        shareAce(Range, editor, ctx)
      }
    }
  }
})()
