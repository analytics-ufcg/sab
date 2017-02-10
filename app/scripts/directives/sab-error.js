(function() {
  'use strict';

  angular.module('sabApp')
    .directive('sabError', sabError);


    /*jshint latedef: nofunc */
    function sabError() {
      return {
        templateUrl: 'views/sab-error.html',
        restrict: 'E',
        scope: {
          expanded: '='
        }
      };
    }
})();
