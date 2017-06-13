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
      vm.selectedReservat = reservatorio;
    }

    function setStep(step) {
      vm.sending = false;
      vm.step = step;
    }

    function sendFile(file) {
      vm.sending = true;
      file.upload = Upload.upload({
        url: RESTAPI.url + '/upload/verificacao',
        data: {file: file},
      });

      file.upload.then(function (response) {
        vm.sending = false;
      }, function (response) {
        if (response.status > 0) {
          console.log(response.status + ': ' + response.data);
        }
      }, function (evt) {
        file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
      });
    }

  }
})();
