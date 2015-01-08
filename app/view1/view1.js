'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.when('/view1', {
            templateUrl: 'view1/view1.html',
            controller: 'View1Ctrl'
        });
    }
])

.controller('View1Ctrl', ['$scope', '$timeout',
    function($scope, $timeout) {
        $scope.ante = 0.50;
        $scope.pot = 0;
        $scope.thinking = false;

        $scope.players = [{
            name: 'You',
            cash: 25,
            cards: [],
            value: 0,
            cutoff: 1400
        }, {
            name: 'Joe Schmoe',
            cash: 25,
            cards: [],
            value: 0,
            cutoff: 1400
        }, {
            name: 'Risky Ralph',
            cash: 25,
            cards: [],
            value: 0,
            cutoff: 1308
        }, {
            name: 'Nervous Natalia',
            cash: 25,
            cards: [],
            value: 0,
            cutoff: 1408
        }, {
            name: 'Joey McAverage',
            cash: 25,
            cards: [],
            value: 0,
            cutoff: 1400
        }];

        $scope.ghost = {
            cards: []
        };

        var deck = new playingCards();

        function anteUp() {
            $scope.players = _.map($scope.players, function(player) {
                player.cash -= $scope.ante;
                $scope.pot += $scope.ante;
                player.lost = $scope.ante;
                return player;
            });
        }

        $scope.deal = function() {
            if ($scope.pot === 0) {
                anteUp();
            }

            $scope.players = _.map($scope.players, function(player) {
                player.cards = [];
                player.value = 0;
                player.won = false;
                player.lost = false;
                return player;
            });
            $scope.players[0].in = false;
            $scope.thinking = true;
            $scope.ghost.cards = [];


            if (deck.count() < (($scope.players.length * 2) + 2)) {
                deck.init();
                deck.shuffle();
            }

            for (var j = 0; j < 2; j++) {
                for (var i = 0; i < $scope.players.length; i++) {
                    $scope.players[i].cards.push(deck.draw());
                }
            }
        };

        function getNum(rank) {
            switch (rank) {
                case 'J':
                    return 11;
                case 'Q':
                    return 12;
                case 'K':
                    return 13;
                case 'A':
                    return 14;
                default:
                    return parseInt(rank, 10);
            }
        }

        function getValue(cards) {
            var card1 = {
                rank: getNum(cards[0].rank),
                suit: cards[0].suit
            };
            var card2 = {
                rank: getNum(cards[1].rank),
                suit: cards[1].suit
            };

            if (card1.rank === card2.rank) {
                return 1413 + card1.rank;
            } else {
                if (card1.suit === card2.suit && (card1.rank === 6 && card2.rank === 9 || (card1.rank === 9 && card2.rank === 6))) {
                    return 1428;
                } else {
                    var larger = Math.max(card1.rank, card2.rank);
                    var smaller = Math.min(card1.rank, card2.rank);

                    return (larger * 100) + smaller;
                }
            }
        }

        function payup(player, multitude) {
            var amount = multitude * $scope.pot;
            player.cash -= amount;
            player.lost = amount;

            return amount;
        }

        function inOrOut() {
            var candidate = false;
            var moreThanOne = false;
            var losers = [];
            angular.forEach($scope.players, function(player, i) {
                var value = getValue(player.cards);
                if ((value > player.cutoff && i !== 0) || player.in) {
                    $scope.players[i].value = value;

                    if (candidate === false) {
                        candidate = i;
                    } else {
                        moreThanOne = true;
                        if (value > $scope.players[candidate].value) {
                            candidate = i;
                        } else if (value === $scope.players[candidate].value) {
                            if (losers.length === 0) {
                                losers.push(candidate);
                            }
                            losers.push(i);
                        }
                    }
                }
            });

            if (candidate !== false) {
                var payload = 0;
                if (moreThanOne) {
                    if (_.contains(losers, candidate)) {
                        angular.forEach(losers, function(i) {
                            payload += payup($scope.players[i], 2);
                        });
                    } else {
                        $scope.players[candidate].cash += $scope.pot;
                        $scope.players[candidate].won = $scope.pot;

                        for (var i = 0; i < $scope.players.length; i++) {
                            if (i !== candidate && $scope.players[i].value) {
                                payload += payup($scope.players[i], 1);
                            }
                        }
                        $scope.pot -= $scope.pot;
                    }
                } else {
                    $scope.ghost.cards.push(deck.draw());
                    $scope.ghost.cards.push(deck.draw());
                    $scope.ghost.value = getValue($scope.ghost.cards);

                    if ($scope.ghost.value > $scope.players[candidate].value) {
                        payload += payup($scope.players[candidate], 2);

                    } else if ($scope.ghost.value === $scope.players[candidate].value) {
                        payload += payup($scope.players[candidate], 3);
                    } else {
                        $scope.players[candidate].cash += $scope.pot;
                        $scope.players[candidate].won = $scope.pot;
                        $scope.pot -= $scope.pot;
                    }
                }

                $scope.pot += payload;

            }
        }

        $scope.no = function() {
            $scope.thinking = false;
            inOrOut();
        };

        $scope.yes = function() {
            $scope.players[0].in = true;
            $scope.thinking = false;
            inOrOut();
        }
    }
]);
