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
  games: [],
  boards: [],
  events: [],
}

world.findGame = function(id) {
  return _.find(world.games, function(g) { return g.id == id })
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
  g.events = []
  world.games.push(g)
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


  // updateWorld
  var updateWorld = function(ev) {
    if (ev) world.events.push(ev)
    socket.emit('world', world)
    socket.broadcast.emit('world', world)
  }

  // joinGame
  // leaveGame
  // markCell
  // unmarkCell
  // setNick

  socket.on('joinGame', function(gameId, callback) {
    // generate board:  gameId-userId
    var game = world.findGame(gameId)
    var board = new Board({
      gameId: gameId,
      userId: me.id,
      vocab: game.vocab
    })
    me.games[gameId] = game
    me.boards[gameId] = board
    callback(board)
  })

  socket.on('markCell', function(gameId, cellNum) {
    var game = world.findGame(gameId)
    var board = me.boards[gameId]
    board.markCell(cellNum)

    var ev = me.nick + " marked " + board.getCell(cellNum)
    game.events.push(ev)
    updateWorld(ev)

    if (board.isWinner()) {
      var win = me.nick + " got BINGO!"
      game.events.push(win)
      socket.emit('winner')
      updateWorld(ev)
    }
  })

  socket.on('unmarkCell', function(gameId, cellNum) {
    var board = me.boards[gameId]
    board.unmarkCell(cellNum)
  })


})






/**
 * server
 */
var port = 3000
console.log('Buzzword Bingo on port ' + port)
app.listen(port)
