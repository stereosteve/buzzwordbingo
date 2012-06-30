'use strict';




var buzzwordbingo = angular.module('buzzwordbingo', [])

var socket = io.connect('/')

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

  $scope.toggleCell = function(cell) {
    console.log(cell)
  }
}

buzzwordbingo.config(function($routeProvider) {
  $routeProvider.when('/lobby', {templateUrl: '/views/lobby.html', controller: LobbyCtrl});
  $routeProvider.when('/game/:id', {templateUrl: '/views/game.html', controller: GameCtrl});
  $routeProvider.otherwise({redirectTo: '/lobby'})
})
