(function() {
  'use strict';

  angular.module('sabApp')
    .controller('MainCtrl', MainCtrl);

  MainCtrl.$inject = ['$scope', 'ReservatorioEquivalente', 'LEGENDCOLORS'];

  /*jshint latedef: nofunc */
  function MainCtrl($scope, ReservatorioEquivalente, LEGENDCOLORS) {
    var vm = this;
    vm.estadoEquivalente = [];
    vm.estadoAtual = {};

    vm.setEstado = setEstado;

    vm.loadingInfo = true;
    vm.gotError = false;

    ReservatorioEquivalente.estadoEquivalente.query(function(response) {
      vm.loadingInfo = true;
      vm.estadoEquivalente = response;
      setEstado("Semiarido");
      vm.loadingInfo = false;
    }, function(error) {
      vm.loadingInfo = false;
      vm.gotError = true;
    });

    function setEstado(uf) {
      for (var i = 0; i < vm.estadoEquivalente.length; i++) {
        if (vm.estadoEquivalente[i].uf === uf){
          vm.estadoAtual = vm.estadoEquivalente[i];
        }
      }
    }

    vm.coresReservatorios = LEGENDCOLORS.reservoirsColors.slice(0,-1);


    $(document).on("click", ".main-sab-path", function() {
      setEstado($(this).attr('data-uf'));
      $('.main-sab-path-select').attr('class', 'main-sab-path');
      $(this).attr('class', 'main-sab-path-select');
      $scope.$apply();
    });

    $(document).on("click", ".main-sab-path-select", function() {
      setEstado("Semiarido");
      $('.main-sab-path-select').attr('class', 'main-sab-path');
      $scope.$apply();
    });

  }
})();
