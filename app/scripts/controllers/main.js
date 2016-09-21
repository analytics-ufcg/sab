(function() {
  'use strict';

  angular.module('sabApp')
    .controller('MainCtrl', MainCtrl);

  MainCtrl.$inject = ['Reservatorio', 'RESTAPI'];

  /*jshint latedef: nofunc */
  function MainCtrl(Reservatorio, RESTAPI) {
    var vm = this;
    vm.reservatorios = [];
    vm.reservatorioSelecionado = {
      nome: "",
      volumes: []
    };
    vm.selectedTab = 2;
    vm.showInfo = true;
    vm.map = {
      center: {
        lat: -10.240929,
        lon: -44.231820,
        zoom: 5
      },
      semiarido: {
        name: 'semiarido',
        source: {
            type: 'TopoJSON',
            url: RESTAPI.url+'/estados/sab'
        }
      },
      reservatorios: {
        name: 'reservatorios',
        source: {
          type: 'TopoJSON',
          url: RESTAPI.url+'/reservatorios'
        }
      }
    };
    vm.setReservatorio = setReservatorio;
    vm.setReservatorioByID = setReservatorioByID;
    vm.isSelectedTab = isSelectedTab;
    vm.setSelectedTab = setSelectedTab;
    vm.toggleInfo = toggleInfo;

    vm.reservatorios = Reservatorio.info.query();

    vm.slider = {
      minValue: 0,
      maxValue: 0,
      options: {
        floor: 0,
        ceil: 0,
        showTicksValues: true
      }
    };

    function setReservatorio(reservatorio) {
      vm.reservatorioSelecionado = reservatorio;
      var data = Reservatorio.monitoramento.query({id: reservatorio.id}, function() {
        vm.reservatorioSelecionado.volumes = data.volumes;

        vm.slider.maxValue = data.anos.ano_info_max;
        vm.slider.minValue = data.anos.ano_info_min;
        vm.slider.options.floor = data.anos.ano_info_min;
        vm.slider.options.ceil = data.anos.ano_info_max;
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

    function getReservStyle() {

    }

  }
})();
