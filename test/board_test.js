var assert = require('assert')
var Board = require('../lib/board')

describe('board', function() {

  it('should have 1 free cell', function() {
    var board = new Board({gameId: 0, userId: 0, vocab: ['one', 'two', 'three']})
    assert.equal(board.isWinner(), false)
    assert.equal(board.countMarked(), 1)
    assert.equal(board.cells[12].marked, true)
  })

  it('should count marked cells', function() {
    var board = new Board({gameId: 0, userId: 0, vocab: ['one', 'two', 'three']})
    board.markCell(1)
    assert.equal(board.countMarked(), 2)
  })

  it('should know a winner', function() {
    var board = new Board({gameId: 0, userId: 0, vocab: ['one', 'two', 'three', 'four', 'five', 'six']})
    board.markCell(0)
    board.markCell(1)
    board.markCell(2)
    board.markCell(3)
    board.markCell(4)
    assert.equal(board.isWinner(), true)
  })

})
