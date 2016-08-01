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
      nome: "",
      volumes: []
    };
    vm.setReservatorio = setReservatorio;
    vm.setReservatorioByID = setReservatorioByID;

    vm.reservatorios = Reservatorio.info.query();

    function setReservatorio(reservatorio) {
      vm.reservatorioSelecionado = reservatorio;
      var data = Reservatorio.monitoramento.query({id: reservatorio.GEOCODIGO}, function() {
        vm.reservatorioSelecionado.volumes = data.volumes;
      });
    }

    function setReservatorioByID(id) {
      for (var i = 0; i < vm.reservatorios.length; i++) {
        if (parseInt(vm.reservatorios[i].GEOCODIGO) === id) {
          setReservatorio(vm.reservatorios[i]);
          break;
        }
      }
    }
  }
})();
