(function() {
  'use strict';

  angular.module('sabApp')
    .controller('MainCtrl', MainCtrl);

  MainCtrl.$inject = ['$scope', 'Reservatorio', 'RESTAPI','olData'];

  /*jshint latedef: nofunc */
  function MainCtrl($scope, Reservatorio, RESTAPI,olData) {
    var vm = this;
  }
})();
