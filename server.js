var express = require('express')
  , _ = require('underscore')
  , slugs = require('slugs')
  , events = require('events')


var app = express.createServer()
app.use(express.static(__dirname + '/app'))

var io = require('socket.io').listen(app)


// user
// room
// board

var allUsers = []


io.sockets.on('connection', function(socket) {

  var user = {
    id: allUsers.length,
    nick: "Player " + allUsers.length,
  }

  socket.on('markCell', function(params, callback) {
    if (!params.room_id || !params.cell_num) {
      console.log("markCell: invalid params", params)
      return false
    }
    params.user_id = user.id

    var room = world.getRoom(params.room_id)
    var board = room.getBoard(user.id)
    board.markCell(params.cell_num)

    socket.broadcast.emit('cellMarked', params)
  })

})


var port = 3000
console.log('Buzzword Bingo on port ' + port)
app.listen(port)
