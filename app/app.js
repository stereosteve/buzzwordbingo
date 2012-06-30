
var rooms = []
  , templates = {}
  , container
  , router

var socket = io.connect('/')

var Router = Backbone.Router.extend({
  routes: {
    "": "welcome",
    "lobby": "lobby",
    "rooms/:id": "room",
  },
  welcome: function() {
    container.html(templates.welcome())
  },
  lobby: function() {
    container.html(templates.lobby(rooms))
  },
  room: function(id) {
    var room = _.find(rooms, function(room) { return room.id === id })
    var $room = $(templates.room(room))
    $room.on('click .cell', function(ev, other) {
      var $cell = $(ev.target)
      if ($cell.hasClass('marked')) {
        $cell.removeClass('marked')
        socket.emit('cell unmarked', $cell.data('num'))
      }
      else {
        $cell.addClass('marked')
        socket.emit('cell marked', $cell.data('num'))
      }
    })
    container.html($room)
  },
})



$(function() {

  container = $('#container')

  function loadTemplate(name) {
    templates[name] = _.template($('#' + name + '_template').text())
  }
  _.each(['welcome', 'lobby', 'room'], function(name) { loadTemplate(name) })

  socket.on('rooms', function(data) {
    rooms = data
    router = new Router()
    Backbone.history.start()
  })

})
