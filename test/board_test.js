var assert = require('assert')
var Board = require('../lib/board')

describe('board', function() {

  it('should have 1 free cell', function() {
    var board = new Board()
    assert.equal(board.isWinner(), false)
    assert.equal(board.countMarked(), 1)
    assert.equal(board.marked[12], true)
  })

  it('should count marked cells', function() {
    var board = new Board()
    board.markCell(1)
    assert.equal(board.countMarked(), 2)
  })

  it('should know a winner', function() {
    var board = new Board()
    board.markCell(0)
    board.markCell(1)
    board.markCell(2)
    board.markCell(3)
    board.markCell(4)
    assert.equal(board.isWinner(), true)
  })

})
