
var rooms = []
  , templates = {}
  , container
  , router

var socket = io.connect('/')

var Router = Backbone.Router.extend({
  routes: {
    "": "lobby",
    "rooms/:id": "room",
  },
  lobby: function() {
    container.html(templates.lobby(rooms))
  },
  room: function(id) {
    var room = _.find(rooms, function(room) { return room.id === id })
    container.html(templates.room(room))
  },
})


$(function() {

  container = $('#container')

  function loadTemplate(name) {
    templates[name] = _.template($('#' + name + '_template').text())
  }
  _.each(['lobby', 'room'], function(name) { loadTemplate(name) })

  socket.on('rooms', function(data) {
    rooms = data
    router = new Router()
    Backbone.history.start()
  })

})
