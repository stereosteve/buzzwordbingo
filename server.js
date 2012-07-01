var express = require('express')
  , _ = require('underscore')
  , slugs = require('slugs')
  , Board = require('./lib/board')


var app = express.createServer()
app.use(express.static(__dirname + '/app'))

var io = require('socket.io').listen(app)





/**
 * world
 */
var world = {
  userCount: 0,
  users: [],
  games: {},
  boards: [],
  events: [],
}

world.findGame = function(id) {
  return world.games[id]
}

/**
 * Create some test games
 */

_.each([
  {
    name: 'Testing',
    vocab: _.range(25),
  },
  {
    name: 'Ruby on Rails',
    vocab: ['cucumber', 'TDD', 'BDD', 'DHH', 'Rack', 'REST', 'MVC', 'DCI' ],
  },
  {
    name: 'Node.js',
    vocab: ['streams', 'Event Emitter', 'Ryan Dahl', 'npm', 'socket.io', 'realtime'],
  }
], function(g) {
  g.id = slugs(g.name)
  g.userCount = 0
  g.users = {}
  g.boards = {}
  g.events = []
  world.games[g.id] = g
})

/**
 * socket
 */
io.sockets.on('connection', function(socket) {

  // On connection
  var me = {
    id: "user" + world.userCount,
    nick: "Player " + world.userCount,
    games: {},
    boards: {},
  }
  world.userCount++
  socket.emit('world', world)
  socket.emit('welcome', me)


  // updateWorld
  var updateWorld = function(ev) {
    if (ev) world.events.push(ev)
    socket.emit('world', world)
    socket.broadcast.emit('world', world)
  }

  socket.on('world', function(callback) {
    callback(world)
  })

  // joinGame
  // leaveGame
  // markCell
  // unmarkCell
  // setNick

  socket.on('joinGame', function(gameId, callback) {
    var game = world.games[gameId]
    if (me.boards[gameId]) {
      callback(me.boards[gameId])
      return
    }
    var board = new Board({
      gameId: gameId,
      userId: me.id,
      vocab: game.vocab
    })
    me.boards[gameId] = board
    game.users[me.id] = me
    updateWorld()
    callback(board)
  })

  socket.on('markCell', function(gameId, cell) {
    var game = world.findGame(gameId)
    var board = me.boards[gameId]
    board.markCell(cell.num)

    var ev = me.nick + " marked " + cell.word
    game.events.push(ev)
    updateWorld(ev)

    if (board.isWinner()) {
      var win = me.nick + " got BINGO!"
      game.events.push(win)
      updateWorld(win)
      socket.emit('winner')
    }
  })

  socket.on('unmarkCell', function(gameId, cell) {
    var board = me.boards[gameId]
    board.unmarkCell(cell.num)
  })


  socket.on('updateNick', function(nick) {
    console.log(nick)
    me.nick = nick
  })


})






/**
 * server
 */
var port = process.env.PORT || 3000
console.log('Buzzword Bingo on port ' + port)
app.listen(port)
