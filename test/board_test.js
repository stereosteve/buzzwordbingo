var assert = require('assert')
var Board = require('../lib/board')

describe('board', function() {

  it('should have 1 free cell', function() {
    var board = Board()
    assert.equal(board.isWinner(), false)
    assert.equal(board.countMarked(), 1)
    assert.equal(board.marked[12], true)
  })

  it('should count marked cells', function() {
    var board = Board()
    board.markCell(1)
    assert.equal(board.countMarked(), 2)
  })

})
