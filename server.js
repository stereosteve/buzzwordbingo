var express = require('express')
  , _ = require('underscore')
  , slugs = require('slugs')
  , Board = require('./lib/board')


var app = express.createServer()
app.use(express.static(__dirname + '/app'))

var io = require('socket.io').listen(app)

io.configure(function() {
  io.set("transports", ["xhr-polling"])
  io.set("polling duration", 10)
})




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
    name: 'Startups',
    vocab: ['Mindset', 'Synergize', 'Agile', 'Software Craftsman', 'Scrum Master', 'Guru', 'Standup', 'Extreme Programming', 'Pair Programming', 'Pair Programming', 'Test Driven Development', 'Leverage', 'NoSQL', 'The Cloud', 'Low hanging fruit', 'Asks', 'Table that', 'Bandwidth', 'Incentivise', 'PAAS', 'SAAS', 'Big Data', 'Metrics', 'Sprint', 'Hackathon', 'ROI', 'Out of Scope', 'Venture', 'Venture', 'Lean', 'Seed Round', 'Angel', 'Series A', 'Market', 'Pivot', 'Hacker', 'Founder', 'Viral', 'Social', 'Gamification', 'Maximize', 'Bubble', 'Location Based', 'Mobile Platform', 'Pervasive', 'Lifestlye', 'Buzzword', 'Market', 'Driven', 'HTML5', 'webapp', 'node.js', 'multiplayer', 'immersive', 'game', 'experience', 'realize', 'profit potential']
  },
  {
    name: 'Ruby on Rails',
    vocab: ['cucumber', 'TDD', 'BDD', 'DHH', 'Rack', 'REST', 'MVC', 'DCI', 'RSpec', 'Sprockets', 'Coffee Script', 'SCSS', 'gem', 'bundler', 'rvm', 'asset pipeline', 'ActiveRecord', 'NoSQL', 'resque', 'capybara', 'agile', 'craftsman', 'haml', 'helper', 'architecture', 'STI', 'Polymorphic'],
  },
  {
    name: 'Node.js',
    vocab: ['streams', 'Event Emitter', 'Ryan Dahl', 'npm', 'socket.io', 'realtime', 'jade', 'stylus', 'less', 'express', 'web scale', 'proxy', 'callback', 'Coffee Script', 'nodeup', 'browserify', 'NoSQL', 'Callback Hell'],
  },
  {
    name: 'Testing',
    vocab: _.range(25),
  },
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

    var ev = {
      msg: me.nick + " marked " + cell.word,
      date: new Date()
    }
    game.events.push(ev)
    updateWorld(ev)

    if (board.isWinner()) {
      var win = me.nick + " got BINGO!"
      game.events.push(win)
      updateWorld(win)
      socket.emit('winner', me)
      socket.broadcast.emit('winner', me)
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
