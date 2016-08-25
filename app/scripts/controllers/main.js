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

        vm.slider.maxValue=data.anos.ano_info_max;
        vm.slider.minValue=data.anos.ano_info_min;
        vm.slider.options.floor=data.anos.ano_info_min;
        vm.slider.options.ceil=data.anos.ano_info_max;
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
  }
})();
