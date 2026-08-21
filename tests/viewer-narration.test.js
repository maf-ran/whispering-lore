/** @jest-environment jsdom */
/* eslint-env node */

const { BaseViewer } = require('../js/viewer-base.js')

function makeViewer() {
  return new BaseViewer({ type: 'items' })
}

describe('BaseViewer.stopNarration', () => {
  let cancelSpy

  beforeEach(() => {
    cancelSpy = jest.fn()
  })

  afterEach(() => {
    delete window.speechSynthesis
  })

  test('cancels speechSynthesis when supported', () => {
    window.speechSynthesis = { cancel: cancelSpy }
    makeViewer().stopNarration()
    expect(cancelSpy).toHaveBeenCalledTimes(1)
  })

  test('does not throw when speechSynthesis unsupported', () => {
    expect(() => makeViewer().stopNarration()).not.toThrow()
    expect(cancelSpy).not.toHaveBeenCalled()
  })

  test('does not throw when speechSynthesis.cancel missing', () => {
    window.speechSynthesis = {}
    expect(() => makeViewer().stopNarration()).not.toThrow()
  })
})
