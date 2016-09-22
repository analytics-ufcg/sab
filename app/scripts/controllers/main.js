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
    vm.selectedTab = 2;
    vm.showInfo = true;
    vm.setReservatorio = setReservatorio;
    vm.setReservatorioByID = setReservatorioByID;
    vm.isSelectedTab = isSelectedTab;
    vm.setSelectedTab = setSelectedTab;
    vm.toggleInfo = toggleInfo;

    vm.reservatorios = Reservatorio.info.query();

    function setReservatorio(reservatorio) {
      vm.reservatorioSelecionado = reservatorio;
      var data = Reservatorio.monitoramento.query({id: reservatorio.id}, function() {
        vm.reservatorioSelecionado.volumes = data.volumes;
      });
    }

    function setReservatorioByID(id) {
      for (var i = 0; i < vm.reservatorios.length; i++) {
        if (parseInt(vm.reservatorios[i].id) === id) {
          setReservatorio(vm.reservatorios[i]);
          break;
        }
      }
    }

    function isSelectedTab(tab) {
      return vm.selectedTab === tab;
    }

    function setSelectedTab(tab) {
      vm.selectedTab = tab;
    }

    function toggleInfo() {
      vm.showInfo = !vm.showInfo;
    }

  }
})();
