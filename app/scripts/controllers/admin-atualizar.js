(function() {
  'use strict';

  angular.module('sabApp')
    .controller('AdminAtualizarCtrl', AdminAtualizarCtrl);

  AdminAtualizarCtrl.$inject = ['RESTAPI', 'Reservatorio'];

  /*jshint latedef: nofunc */
  function AdminAtualizarCtrl(RESTAPI, Reservatorio) {
    var vm = this;
    vm.reservatorioSelecionado = {};
    vm.reservatorios = [];
    vm.step = 1;
    vm.sending = false;
    vm.RESTAPI = RESTAPI;

    vm.setReservatorio = setReservatorio;
    vm.setStep = setStep;
    vm.sendFile = sendFile;

    function init() {
      Reservatorio.info.query(function(data) {
        vm.reservatorios = data;
      });
    }
    init();

    function setReservatorio(reservatorio) {
      console.log(reservatorio);
      vm.reservatorioSelecionado = reservatorio;
      vm.step = 2;
    }

    function setStep(step) {
      vm.sending = false;
      vm.step = step;
    }

    function sendFile() {
      vm.sending = true;
    }
  }
})();
