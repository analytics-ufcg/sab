(function() {
  'use strict';

  angular.module('sabApp')
    .controller('MainCtrl', MainCtrl);

  MainCtrl.$inject = ['$scope', 'ReservatorioEquivalente', 'LEGENDCOLORS'];

  /*jshint latedef: nofunc */
  function MainCtrl($scope, ReservatorioEquivalente, LEGENDCOLORS) {
    var vm = this;
    vm.mapSabData = {};
    vm.mapBrData = {};
    vm.estadoEquivalente = [];
    vm.estadoAtual = {};

    vm.setEstado = setEstado;

    vm.loadingInfo = true;

    ReservatorioEquivalente.mapSabGeoJson.query(function(response) {
      vm.loadingInfo = true;      
      vm.mapSabData = response;
      vm.loadingInfo = false;
    });

    ReservatorioEquivalente.mapBrGeoJson.query(function(response) {
      vm.loadingInfo = true;      
      vm.mapBrData = response;
      vm.loadingInfo = false;
    });

    ReservatorioEquivalente.estadoEquivalente.query(function(response) {
      vm.loadingInfo = true;
      vm.estadoEquivalente = response;
      setEstado("Semiarido");
      vm.loadingInfo = false;
    });

    function setEstado(uf) {
      for (var i = 0; i < vm.estadoEquivalente.length; i++) {
        if (vm.estadoEquivalente[i].uf == uf){
          vm.estadoAtual = vm.estadoEquivalente[i];
        }
      }
    }

    vm.coresReservatorios = LEGENDCOLORS.reservoirsColors.slice(0,-1);

  }
})();
