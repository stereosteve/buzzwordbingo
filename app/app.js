
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




var Router = Backbone.Router.extend({
  routes: {
    "": "welcome",
    "lobby": "lobby",
    "rooms/:id": "room",
  },
  welcome: function() {
    container.html(new WelcomeView().render().el)
  },
  lobby: function() {
    container.html(templates.lobby(rooms))
  },
  room: function(id) {

    var roomid = id
    socket.emit('join', id, function(board) {
      console.log(board)
      var $room = $(templates.board(board))
      $room.find("[data-num=12]").addClass('marked')
      $room.on('click .cell', function(ev, other) {
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
      container.html($room)
    })


  },
})



$(function() {

  container = $('#container')

  function loadTemplate(name) {
    templates[name] = _.template($('#' + name + '_template').text())
  }
  _.each(['welcome', 'lobby', 'board'], function(name) { loadTemplate(name) })

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
