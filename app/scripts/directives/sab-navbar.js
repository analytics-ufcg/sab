(function() {
  'use strict';

  angular.module('sabApp')
    .directive('sabNavbar', sabNavbar);


    /*jshint latedef: nofunc */
    function sabNavbar() {
      return {
        templateUrl: 'views/sab-navbar.html',
        restrict: 'E',
        scope: {
          expanded: '='
        }
      };
    }
})();
