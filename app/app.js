'use strict';




var buzzwordbingo = angular.module('buzzwordbingo', [])

var socket = io.connect('/')
var gotit = false
socket.on('winner', function(me) {
  //debugger
  if (!gotit) alert(me.nick + " got BINGO!")
  gotit = true
})
socket.on('me', function(me) {
  console.log('welcome', me)
})

//buzzwordbingo



/**
 * Controllers
 *
 */
function LobbyCtrl($scope, $location) {
  socket.emit('world', function(err, w) {
    $scope.world = w
    $scope.$apply()
  })
  $scope.$watch('nick', function(nick) {
    socket.emit('updateNick', nick)
  })
  $scope.editGame = function(game) {
    console.log("edit", game)
    $location.path('game/' + game.id + '/edit')
  }
}

function GameCtrl($scope, $routeParams) {
  var gameId = $routeParams.id

  socket.emit('joinGame', gameId, function(err, b) {
    $scope.board = b
    $scope.$apply()
  })

  socket.on('world', function(w) {
    $scope.world = w
    $scope.game = w.games[gameId]
    $scope.events = $scope.game.events.reverse()
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


var ctrl = {}
ctrl.game = {}
ctrl.game.edit = function($scope, $routeParams) {

  var gameId = $routeParams.id
  socket.emit('game.get', gameId, function(err, game) {
    $scope.game = game
    $scope.$apply()
  })

  $scope.addWord = function() {
    var params = {
      gameId: gameId,
      word: $scope.newWord,
    }
    socket.emit('game.addWord', params, function(err, game) {
      $scope.game = game
      $scope.newWord = undefined
      $scope.$apply()
    })
    //$scope.game.vocab.push($scope.newWord)
  }

  $scope.removeWord = function(word) {
    var params = {
      gameId: gameId,
      word: word,
    }
    socket.emit('game.removeWord', params, function(err, game) {
      $scope.game = game
      $scope.$apply()
    })
  }
}



/**
 * Routes
 *
 */
buzzwordbingo.config(function($routeProvider) {
  $routeProvider.when('/lobby', {templateUrl: '/views/lobby.html', controller: LobbyCtrl});
  $routeProvider.when('/game/:id', {templateUrl: '/views/game.html', controller: GameCtrl});
  $routeProvider.when('/game/:id/edit', {templateUrl: '/views/game-edit.html', controller: ctrl.game.edit});
  $routeProvider.otherwise({redirectTo: '/lobby'})
})

buzzwordbingo.run(function($rootScope) {
  $rootScope.nick = "Noob " + Math.floor(Math.random() * 1000)
})
