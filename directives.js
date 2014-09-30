'use strict';

angular.module('myApp')
    .directive('table', function() {
        return {
            restrict: 'E',
            link: function postLink(scope, element, attrs) {
                element.playingCards();
            }
        };
    })
    .directive('card', function() {
        return {
            restrict: 'E',
            template: '<img ng-src="{{image}}" />',
            scope: {
                cVal: '='
            },
            link: function postLink(scope, element, attrs) {
                scope.$watch('cVal', function(newVal) {
                    if (newVal === undefined) {
                        return;
                    }
                    
                    var rank = newVal.rank === 'A' ? 1 : newVal.rank.toLowerCase();

                    scope.image = 'img/cards/' + newVal.suit + rank + '.png'
                })
            }
        };
    });
