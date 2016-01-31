'use babel'

import {CompositeDisposable} from 'atom'

const defaultEOL = process.platform === 'win32' ? 'CRLF' : 'LF'

module.exports = {
  config: {
    preferredEOL: {
      title: 'Preferred EOL',
      type: 'string',
      enum: ['LF', 'CRLF'],
      default: defaultEOL
    }
  },
  activate() {
    this.buffers = new Set()
    this.subscriptions = new CompositeDisposable()
    this.subscriptions.add(atom.config.observe('eol-enforcer.preferredEOL', preferredEOL => {
      this.preferredEOL = preferredEOL === 'CRLF' ? '\r\n' : '\n'
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
  },
  deactivate() {
    this.subscriptions.dispose()
  }
}
