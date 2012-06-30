
var _ = require('underscore')

module.exports = function (id, vocab) {
  var board = {}
  board.marked = []
  board.cells = _.shuffle(vocab)
  board.marked[12] = true
  board.cells[12] = "FREE"

  board.markCell = function(num) {
    board.marked[num] = true
  }

  board.unmarkCell = function(num) {
    board.marked[num] = false
  }

  board.isWinner = function() {
    var marked = board.marked
    var winner = false
    var rowScores = [0,0,0,0,0]
    var colScores = [0,0,0,0,0]
    marked.forEach(function(isMarked, num) {
      var row = Math.floor(num/5)
      var col = num % 5
      if (isMarked) {
        rowScores[row] += 1
        colScores[col] += 1
        if (rowScores[row] === 5 || colScores[col] === 5) winner = true
      }
    })
    if (_.all([0, 6, 12, 18, 24], function(c) { return marked[c] })) winner = true
    if (_.all([4, 8, 12, 16, 20], function(c) { return marked[c] })) winner = true
    return winner
  }

  board.countMarked = function() {
    return _.compact(board.marked).length
  }

  return board
}
