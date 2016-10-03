(function() {
  'use strict';

  angular.module('sabApp')
    .directive('legendaCoresReservatorios', legendaCoresReservatorios);

    legendaCoresReservatorios.$inject = ['$window'];

    /*jshint latedef: nofunc */
    function legendaCoresReservatorios($window) {
      return {
        template: '',
        restrict: 'E',
        scope: {
          cores: '='
        },
        link: function postLink(scope, element) {
          console.log(scope.cores);
        }
      }
    };
})();
