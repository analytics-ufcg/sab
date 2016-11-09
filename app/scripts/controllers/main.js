(function() {
  'use strict';

  angular.module('sabApp')
    .controller('MainCtrl', MainCtrl);

  MainCtrl.$inject = ['$scope', 'ReservatorioEquivalente', 'RESTAPI','olData'];

  /*jshint latedef: nofunc */
  function MainCtrl($scope, ReservatorioEquivalente, RESTAPI,olData) {
    var vm = this;
    vm.sabMapa = {};
    vm.estadoEquivalente = [];
    vm.estadoAtual = {};

    vm.setEstado = setEstado;

    ReservatorioEquivalente.sabMapa.query(function(response) {
    	vm.sabMapa = response;
    });

    ReservatorioEquivalente.estadoEquivalente.query(function(response) {
    	vm.estadoEquivalente = response;
    	setEstado("Semiarido");
    });

    function setEstado(uf){
    	for (var i = 0; i < vm.estadoEquivalente.length; i++) {
    		if (vm.estadoEquivalente[i].uf == uf){
    			vm.estadoAtual = vm.estadoEquivalente[i];
    		}
    	}
    }

  }
})();
