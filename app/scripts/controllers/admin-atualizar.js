(function() {
  'use strict';

  angular.module('sabApp')
    .controller('AdminAtualizarCtrl', AdminAtualizarCtrl);

  AdminAtualizarCtrl.$inject = ['RESTAPI', 'Reservatorio', 'Upload', '$http'];

  /*jshint latedef: nofunc */
  function AdminAtualizarCtrl(RESTAPI, Reservatorio, Upload, $http) {
    var vm = this;
    vm.selectedReservat = {};
    vm.reservatorios = [];
    vm.step = 1;
    vm.file = {
      sending: false,
      verified: false,
      rejected: false,
      replaced: false,
      lines: 0
    }
    vm.RESTAPI = RESTAPI;

    vm.setReservatorio = setReservatorio;
    vm.setStep = setStep;
    vm.sendFile = sendFile;
    vm.reset = reset;
    vm.confirm = confirm;

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
      vm.step = 3;
      file.upload = Upload.upload({
        url: RESTAPI.url + '/upload/verificacao',
        data: {
          reservatId: vm.selectedReservat.id,
          file: file
        },
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
      vm.file.replaced = false;
    }

    function confirm() {
      $http({
        method: 'GET',
        url: RESTAPI.url + '/upload/confirmacao/'+vm.selectedReservat.id
      }).then(function(response) {
        vm.step = 4;
        vm.file.replaced = response.data.replaced;
      });
    }

  }
})();
