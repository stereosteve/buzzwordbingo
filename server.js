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
    board.cells = _.shuffle(board.vocab)
    board.cells[12] = "FREE"
    callback(board)
  })
  socket.on('cell marked', function(num) {
    console.log(socket.nick, 'marked', num)
  })
  socket.on('cell unmarked', function(num) {
    console.log(socket.nick, 'unmarked', num)
  })
})


var port = 3000
console.log('Buzzword Bingo on port ' + port)
app.listen(port)
