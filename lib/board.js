var _ = require('underscore')


var Board = function(params) {
  _.extend(this, params)
  this.id = params.gameId + params.userId
  this.marked = []
  this.cells = _.shuffle(params.vocab)
  this.marked[12] = true
  this.cells[12] = "FREE"
}

Board.prototype.markCell = function(num) {
  this.marked[num] = true
}

Board.prototype.unmarkCell = function(num) {
  this.marked[num] = false
}

Board.prototype.getCell = function(num) {
  return this.cells[num]
}

Board.prototype.isWinner = function() {
  var marked = this.marked
  var winner = false
  var rowScores = [0,0,0,0,0]
  var colScores = [0,0,0,0,0]
  this.marked.forEach(function(isMarked, num) {
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

Board.prototype.countMarked = function() {
  return _.compact(this.marked).length
}

module.exports = Board
