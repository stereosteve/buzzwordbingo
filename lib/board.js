var _ = require('underscore')


var Board = function(params) {
  _.extend(this, params)
  this.id = params.gameId + params.userId

  var words = _.shuffle(params.vocab)
  words = _.first(words, 25)

  var cells = []
  words.forEach(function(word, num) {
    cells.push({
      num: num,
      word: word,
      marked: false
    })
  })
  cells[12] = {
    num: 12,
    word: 'FREE',
    marked: true,
    classes: 'marked'
  }
  this.cells = cells

  var rows = []
  this.cells.forEach(function(cell, num) {
    var rowNum = Math.floor(num/5)
    if (!rows[rowNum]) rows[rowNum] = []
    rows[rowNum].push(cell)
  })
  this.rows = rows

}

Board.prototype.markCell = function(num) {
  var cell = this.cells[num]
  cell.marked = true
  cell.classes = 'marked'
}

Board.prototype.unmarkCell = function(num) {
  var cell = this.cells[num]
  cell.marked = false
  cell.classes = ''
}

Board.prototype.getCell = function(num) {
  return this.cells[num]
}

Board.prototype.isWinner = function() {
  var cells = this.cells
  var winner = false
  var rowScores = [0,0,0,0,0]
  var colScores = [0,0,0,0,0]
  cells.forEach(function(cell, num) {
    var row = Math.floor(num/5)
    var col = num % 5
    if (cell.marked) {
      rowScores[row] += 1
      colScores[col] += 1
      if (rowScores[row] === 5 || colScores[col] === 5) winner = true
    }
  })
  if (_.all([0, 6, 12, 18, 24], function(c) { return cells[c] && cells[c].marked })) winner = true
  if (_.all([4, 8, 12, 16, 20], function(c) { return cells[c] && cells[c].marked })) winner = true
  return winner
}

Board.prototype.countMarked = function() {
  var marked = _.pluck(this.cells, 'marked')
  return _.compact(marked).length
}

module.exports = Board
