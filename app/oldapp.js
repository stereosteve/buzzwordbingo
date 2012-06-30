var world
  , templates = {}
  , container
  , router

var socket = io.connect('/')



var LobbyView = Backbone.View.extend({
  events: {
    "submit form": "setNick"
  },
  setNick: function(ev) {
    ev.preventDefault()
    var nick = this.$el.find('.nick').val()
    if (nick) {
      socket.emit('setNick', nick)
      $("#nav-nick").text(nick)
    }
    else {
      alert("Nick is required")
    }
  },
  render: function() {
    this.$el.html(templates.lobby(world))
    return this
  }
})





var GameView = Backbone.View.extend({
  render: function() {
    this.$el.html(templates.game())
    return this
  },
})


var BoardView = Backbone.View.extend({
  events: {
    'click .cell': 'cellClicked'
  },
  render: function() {
    var board = this.model
    var $el = this.$el
    $el.html(templates.board(board))
    $el.find("[data-num=12]").addClass('marked')
    return this
  },
  cellClicked: function(ev) {
    var $cell = $(ev.target)
    var board = this.model
    if ($cell.data('num') === 12) {
      return false
    }
    else if ($cell.hasClass('marked')) {
      $cell.removeClass('marked')
      socket.emit('unmarkCell', board.gameId, $cell.data('num'))
    }
    else {
      $cell.addClass('marked')
      socket.emit('markCell', board.gameId, $cell.data('num'))
    }
  },
})


var NewsfeedView = Backbone.View.extend({
  initialize: function() {
    var self = this
    socket.on('world', function(world) {
      console.log("yeehaw")
      self.render()
    })
  },
  render: function() {
    this.$el.html(templates.newsfeed(world))
    return this
  }
})




var Router = Backbone.Router.extend({
  routes: {
    "": "lobby",
    "game/:id": "game",
  },
  lobby: function() {
    container.html(new LobbyView().render().el)
  },
  game: function(gameid) {
    var gameView = new GameView().render()
    var newsfeedView = new NewsfeedView().render()
    gameView.$el.find('.newsfeed').html(newsfeedView.el)
    socket.emit('joinGame', gameid, function(board) {
      var boardView = new BoardView({model: board}).render()
      gameView.$el.find('.my_board').html(boardView.el)
    })
    container.html(gameView.el)
  },
})



$(function() {

  container = $('#container')

  function loadTemplate(name) {
    templates[name] = _.template($('#' + name + '_template').text())
  }
  _.each(['lobby', 'game', 'board', 'newsfeed'], function(name) { loadTemplate(name) })

  var started = false
  socket.on('world', function(data) {
    world = data
    if (!started) {
      started = true
      router = new Router()
      Backbone.history.start()
    }
  })

  socket.on('winner', function() {
    console.log("Winnar!")
    debugger
  })

})

