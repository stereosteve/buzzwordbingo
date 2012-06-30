var express = require('express')
  , _ = require('underscore')

var rooms = [
  {
    id: 'testing',
    name: 'Testing',
    vocab: _.range(25),
  },
  {
    id: 'ruby-on-rails',
    name: 'Ruby on Rails',
    vocab: ['cucumber', 'TDD', 'BDD', 'DHH', 'Rack', 'REST', 'MVC', 'DCI' ],
  },
  {
    id: 'node-js',
    name: 'Node.js',
    vocab: ['streams', 'Event Emitter', 'Ryan Dahl', 'npm', 'socket.io', 'realtime'],
  }
]

var app = express.createServer()
app.use(express.static(__dirname + '/app'))

var io = require('socket.io').listen(app)
io.sockets.on('connection', function(socket) {

  socket.emit('rooms', rooms)

  socket.on('nick', function(nick) {
    console.log('Welcome', nick)
    socket.nick = nick
  })

  socket.on('join', function(roomid, callback) {
    console.log(socket.nick, 'joined', roomid)
    var room = _.find(rooms, function(r) { return r.id === roomid })
    var board = _.clone(room)
    board.nick = socket.nick
    board.marked = []
    board.marked[12] = true
    board.cells = _.shuffle(board.vocab)
    board.cells[12] = "FREE"
    socket.board = board
    callback(board)
  })

  socket.on('cell marked', function(num) {
    var marked = socket.board.marked
    marked[num] = true

    // check for winner
    var winner = false
    var rowScores = [0,0,0,0,0]
    var colScores = [0,0,0,0,0]
    marked.forEach(function(marked, num) {
      var row = Math.floor(num/5)
      var col = num % 5
      if (marked) {
        rowScores[row] += 1
        colScores[col] += 1
        if (rowScores[row] === 5 || colScores[col] === 5) winner = true
      }
    })
    if (_.all([0, 6, 12, 18, 24], function(c) { return marked[c] })) winner = true
    if (_.all([4, 8, 12, 16, 20], function(c) { return marked[c] })) winner = true

    if (winner) {
      socket.emit('winner')
      socket.broadcast.emit('winner', socket.nick)
    }

  })

  socket.on('cell unmarked', function(num) {
    console.log(socket.nick, 'unmarked', num)
    socket.board.marked[num] = false
    console.log(socket.board.marked)
  })

})


var port = 3000
console.log('Buzzword Bingo on port ' + port)
app.listen(port)
