'use strict';




var buzzwordbingo = angular.module('buzzwordbingo', [])

var socket = io.connect('/')
socket.on('winner', function() {
  //debugger
  console.log("BINGO")
})

function LobbyCtrl($scope) {
  socket.emit('world', function(w) {
    $scope.world = w
    $scope.$apply()
  })
}

function GameCtrl($scope, $routeParams) {
  socket.emit('joinGame', $routeParams.id, function(b) {
    $scope.board = b
    $scope.$apply()
  })

  socket.on('world', function(w) {
    $scope.world = w
    $scope.$apply()
  })

  $scope.toggleCell = function(cell) {
    if (cell.num === 12) return
    var board = $scope.board
    if (cell.marked) {
      cell.marked = false
      cell.classes = ''
      socket.emit('unmarkCell', board.gameId, cell)
    }
    else {
      cell.marked = true
      cell.classes = 'marked'
      socket.emit('markCell', board.gameId, cell)
    }
  }
}

buzzwordbingo.config(function($routeProvider) {
  $routeProvider.when('/lobby', {templateUrl: '/views/lobby.html', controller: LobbyCtrl});
  $routeProvider.when('/game/:id', {templateUrl: '/views/game.html', controller: GameCtrl});
  $routeProvider.otherwise({redirectTo: '/lobby'})
})
