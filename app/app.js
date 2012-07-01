'use strict';




var buzzwordbingo = angular.module('buzzwordbingo', [])

var socket = io.connect('/')
socket.on('winner', function(me) {
  //debugger
  alert(me.nick + " got BINGO!")
})
socket.on('me', function(me) {
  console.log('welcome', me)
})

//buzzwordbingo



/**
 * Controllers
 *
 */
function LobbyCtrl($scope, $rootScope) {
  socket.emit('world', function(w) {
    $scope.world = w
    $scope.$apply()
  })
  $scope.$watch('nick', function(nick) {
    socket.emit('updateNick', nick)
  })
}

function GameCtrl($scope, $routeParams) {
  var gameId = $routeParams.id

  socket.emit('joinGame', gameId, function(b) {
    $scope.board = b
    $scope.$apply()
  })

  socket.on('world', function(w) {
    $scope.world = w
    $scope.game = w.games[gameId]
    $scope.$apply()
  })

  $scope.toggleCell = function(cell) {
    if (cell.num === 12) return
    var board = $scope.board
    if (cell.marked) {
      cell.marked = false
      cell.classes = ''
      socket.emit('unmarkCell', gameId, cell)
    }
    else {
      cell.marked = true
      cell.classes = 'marked'
      socket.emit('markCell', gameId, cell)
    }
  }

}




/**
 * Routes
 *
 */
buzzwordbingo.config(function($routeProvider) {
  $routeProvider.when('/lobby', {templateUrl: '/views/lobby.html', controller: LobbyCtrl});
  $routeProvider.when('/game/:id', {templateUrl: '/views/game.html', controller: GameCtrl});
  $routeProvider.otherwise({redirectTo: '/lobby'})
})

buzzwordbingo.run(function($rootScope) {
  $rootScope.nick = "Noob " + Math.floor(Math.random() * 1000)
})
