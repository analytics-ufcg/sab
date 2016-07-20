(function() {
  'use strict';

  angular.module('sabApp')
    .controller('MainCtrl', MainCtrl);

  MainCtrl.$inject = ['Reservatorio'];

  function MainCtrl(Reservatorio) {
    var vm = this;
    vm.reservatorios = [];

    vm.reservatorios = Reservatorio.query();
  }
})();
