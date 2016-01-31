'use babel'

import {CompositeDisposable} from 'atom'

const EOL_DETECTION_REGEX = /\r\n|\n/
const EOL_REPLACEMENT_REGEX = /\r\n|\n/g

module.exports = {
  activate() {
    this.buffers = new WeakSet()
    this.subscriptions = new CompositeDisposable()
    this.subscriptions.add(atom.config.observe('line-ending-selector.defaultLineEnding', preferredEOL => {
      this.preferredEOL =
        preferredEOL === 'CRLF' ? '\r\n' :
        preferredEOL === 'LF' ? '\n' :
        process.platform === 'win32' ? '\r\n' : '\n'
    }))

    this.subscriptions.add(atom.workspace.observeTextEditors(textEditor => {
      const textBuffer = textEditor.getBuffer()
      if (!this.buffers.has(textBuffer)) {
        this.buffers.add(textBuffer)
        this.applyChange(textBuffer)
      }
    }))
  },
  applyChange(buffer) {
    buffer.setPreferredLineEnding(this.preferredEOL)
    const bufferText = buffer.getText()
    if (bufferText.length) {
      const matches = EOL_DETECTION_REGEX.exec(bufferText)
      if (matches && matches[0] !== this.preferredEOL) {
        buffer.setText(buffer.getText().replace(EOL_REPLACEMENT_REGEX, this.preferredEOL))
      }
    }
  },
  deactivate() {
    this.subscriptions.dispose()
  }
}
