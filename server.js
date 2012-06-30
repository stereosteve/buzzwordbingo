var express = require('express')

var rooms = [
  {
    name: 'Ruby on Rails',
    vocab: ['cucumber', 'TDD', 'BDD', 'DHH', 'Rack', 'REST', 'MVC', 'DCI' ],
  },
  {
    name: 'Node.js',
    vocab: ['streams', 'Event Emitter', 'Ryan Dahl', 'npm', 'socket.io', 'realtime'],
  }
]

var app = express.createServer()
app.use(express.static(__dirname + '/app'))

var io = require('socket.io').listen(app)
io.sockets.on('connection', function(socket) {
  socket.emit('rooms', rooms)
})


var port = 3000
console.log('Buzzword Bingo on port ' + port)
app.listen(port)
