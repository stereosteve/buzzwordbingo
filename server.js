var express = require('express')
  , _ = require('underscore')
  , slugs = require('slugs')
  , Board = require('./lib/board')


var app = express.createServer()
app.use(express.static(__dirname + '/app'))

var io = require('socket.io').listen(app)

//io.configure(function() {
  //io.set("transports", ["xhr-polling"])
  //io.set("polling duration", 10)
//})




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
    callback(null, world)
  })

  // joinGame
  // leaveGame
  // markCell
  // unmarkCell
  // setNick

  socket.on('game.get', function(gameId, callback) {
    callback(null, world.games[gameId])
  })


  socket.on('game.addWord', function(params, callback) {
    var game = world.games[params.gameId]
    var word = params.word
    console.log("game.addWord", params)
    if (game && word) {
      game.vocab.push(word)
      var ev = {
        msg: me.nick + " added " + word + " to game " + game.name,
        date: new Date()
      }
      updateWorld(ev)
      callback(null, game)
    }
  })

  socket.on('game.removeWord', function(params, callback) {
    var game = world.games[params.gameId]
    var word = params.word
    if (game && word) {
      game.vocab = _.reject(game.vocab, function(v) { return v === word })
      var ev = {
        msg: me.nick + " removed " + word + " from game " + game.name,
        date: new Date()
      }
      updateWorld(ev)
      callback(null, game)
    }
  })





  socket.on('joinGame', function(gameId, callback) {
    if (me.boards[gameId]) {
      callback(null, me.boards[gameId])
      return
    }
    else if (world.games[gameId]) {
      var game = world.games[gameId]
      var board = new Board({
        gameId: gameId,
        userId: me.id,
        vocab: game.vocab
      })
      me.boards[gameId] = board
      game.users[me.id] = me
      updateWorld()
      callback(null, board)
    }
    else {
      callback("Game not found: " + gameId)
    }
  })

  socket.on('markCell', function(gameId, cell) {
    var game = world.games[gameId]
    var board = me.boards[gameId]

    if (game && board) {
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
    }
  })

  socket.on('unmarkCell', function(gameId, cell) {
    var board = me.boards[gameId]
    if (board) board.unmarkCell(cell.num)
  })


  socket.on('updateNick', function(nick) {
    if (nick && nick.length > 0) me.nick = nick
  })


})






/**
 * server
 */
var port = process.env.PORT || 3000
console.log('Buzzword Bingo on port ' + port)
app.listen(port)
