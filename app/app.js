
var rooms = []
  , templates = {}
  , container
  , router

var socket = io.connect('/')



var WelcomeView = Backbone.View.extend({
  events: {
    "submit form": "setNick"
  },
  setNick: function(ev) {
    ev.preventDefault()
    var nick = this.$el.find('.nick').val()
    if (nick) {
      socket.emit('nick', nick)
      $("#nav-nick").text(nick)
    }
    else {
      alert("Nick is required")
    }
  },
  render: function() {
    this.$el.html(templates.welcome())
    return this
  }
})


var RoomView = Backbone.View.extend({
  render: function() {
    this.$el.html(templates.room())
    return this
  }
})



var Router = Backbone.Router.extend({
  routes: {
    "": "welcome",
    "lobby": "lobby",
    "rooms/:id": "room",
    "testroom": "testroom",
  },
  welcome: function() {
    container.html(new WelcomeView().render().el)
  },
  lobby: function() {
    container.html(templates.lobby(rooms))
  },
  testroom: function() {
    container.html(new RoomView().render().el)
  },
  room: function(id) {

    var roomView = new RoomView().render()

    var roomid = id
    socket.emit('join', roomid, function(board) {
      var $board = $(templates.board(board))
      $board.find("[data-num=12]").addClass('marked')
      $board.on('click .cell', function(ev, other) {
        var $cell = $(ev.target)
        if ($cell.data('num') === 12) {
          return false
        }
        else if ($cell.hasClass('marked')) {
          $cell.removeClass('marked')
          socket.emit('cell unmarked', $cell.data('num'))
        }
        else {
          $cell.addClass('marked')
          socket.emit('cell marked', $cell.data('num'))
        }
      })
      roomView.$el.find('.my_board').html($board)
    })

    container.html(roomView.el)

  },
})



$(function() {

  container = $('#container')

  function loadTemplate(name) {
    templates[name] = _.template($('#' + name + '_template').text())
  }
  _.each(['welcome', 'lobby', 'board', 'room'], function(name) { loadTemplate(name) })

  socket.emit('nick', "Player " + Math.random() * 100)
  socket.on('rooms', function(data) {
    rooms = data
    router = new Router()
    Backbone.history.start()
  })

  socket.on('winner', function() {
    console.log("Winnar!")
    debugger
  })

})
