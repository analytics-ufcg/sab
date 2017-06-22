(function() {
  'use strict';

  angular.module('sabApp')
    .controller('AdminAtualizarCtrl', AdminAtualizarCtrl);

  AdminAtualizarCtrl.$inject = ['RESTAPI', 'Reservatorio', 'Upload'];

  /*jshint latedef: nofunc */
  function AdminAtualizarCtrl(RESTAPI, Reservatorio, Upload) {
    var vm = this;
    vm.selectedReservat = {};
    vm.reservatorios = [];
    vm.step = 1;
    vm.file = {
      sending: false,
      verified: false,
      rejected: false,
      lines: 0
    }
    vm.RESTAPI = RESTAPI;

    vm.setReservatorio = setReservatorio;
    vm.setStep = setStep;
    vm.sendFile = sendFile;
    vm.reset = reset;

    function init() {
      Reservatorio.info.query(function(data) {
        vm.reservatorios = data;
      });
    }
    init();

    function setReservatorio(reservatorio) {
      vm.selectedReservat = reservatorio;
    }

    function setStep(step) {
      vm.file.sending = false;
      vm.file.verified = false;
      vm.step = step;
    }

    function sendFile(file) {
      vm.file.sending = true;
      vm.file.verified = false;
      file.upload = Upload.upload({
        url: RESTAPI.url + '/upload/verificacao',
        data: {file: file},
      });

      file.upload.then(function (response) {
        vm.file.sending = false;
        vm.file.verified = response.data.valido;
        vm.file.rejected = !vm.file.verified;
        vm.file.lines = response.data.linhas;
      });
    }

    function reset() {
      vm.selectedReservat = {};
      vm.step = 1;
      vm.file.sending = false;
      vm.file.verified = false;
      vm.file.rejected = false;
    }

  }
})();
