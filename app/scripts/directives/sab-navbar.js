(function() {
  'use strict';

  angular.module('sabApp')
    .directive('sabNavbar', sabNavbar);

    sabNavbar.$inject = ['$state'];

    /*jshint latedef: nofunc */
    function sabNavbar($state) {
      return {
        templateUrl: 'views/sab-navbar.html',
        restrict: 'E',
        link: function postLink(scope, element) {
        }
      }
    };
})();
