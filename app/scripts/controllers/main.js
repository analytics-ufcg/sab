(function() {
  'use strict';

  angular.module('sabApp')
    .controller('MainCtrl', MainCtrl);

  MainCtrl.$inject = ['Reservatorio'];

  /*jshint latedef: nofunc */
  function MainCtrl(Reservatorio) {
    var vm = this;
    vm.reservatorios = [];
    vm.reservatorioSelecionado = {
      Reserv: ""
    };
    vm.setReservatorio = setReservatorio;
    vm.setReservatorioByID = setReservatorioByID;

    vm.reservatorios = Reservatorio.query();

    function setReservatorio(reservatorio) {
      vm.reservatorioSelecionado = reservatorio;
    }

    function setReservatorioByID(id) {
      for (var i = 0; i < vm.reservatorios.length; i++) {
        if(vm.reservatorios[i].CodigoANA === id){
          setReservatorio(vm.reservatorios[i]);
        }
      }
    }
  }
})();
