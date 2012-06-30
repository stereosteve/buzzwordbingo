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
  socket.on('cell marked', function(num) {
    console.log('marked', num)
  })
  socket.on('cell unmarked', function(num) {
    console.log('unmarked', num)
  })
})


var port = 3000
console.log('Buzzword Bingo on port ' + port)
app.listen(port)
