(function() {
  'use strict';

  angular.module('sabApp')
    .controller('MainCtrl', MainCtrl);

  MainCtrl.$inject = ['$scope', 'ReservatorioEquivalente', 'RESTAPI','olData'];

  /*jshint latedef: nofunc */
  function MainCtrl($scope, ReservatorioEquivalente, RESTAPI,olData) {
    var vm = this;
    vm.mapSabData = {};
    vm.mapBrData = {};
    vm.estadoEquivalente = [];
    vm.estadoAtual = {};

    vm.setEstado = setEstado;

    vm.loadingInfo = true;

    ReservatorioEquivalente.mapSabData.query(function(response) {
		vm.loadingInfo = true;    	
    	vm.mapSabData = response;
    	vm.loadingInfo = false;
    });

    ReservatorioEquivalente.mapBrData.query(function(response) {
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

    function setEstado(uf){
    	for (var i = 0; i < vm.estadoEquivalente.length; i++) {
    		if (vm.estadoEquivalente[i].uf == uf){
    			vm.estadoAtual = vm.estadoEquivalente[i];
    		}
    	}
    }

    vm.coresReservatorios = [
      {cor: '#ff2222', texto: 'Abaixo de 10%'},
      {cor: '#ff8f61', texto: '10% - 25%'},
      {cor: '#fffc9f', texto: '25% - 50%'},
      {cor: '#99bfcf', texto: '50% - 75%'},
      {cor: '#3381ff', texto: 'Acima de 75%'},
      {cor: '#ffffff', texto: 'Sem informação'}
    ];

  }
})();
