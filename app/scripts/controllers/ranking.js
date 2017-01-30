(function() {
  'use strict';

  angular.module('sabApp')
    .controller('RankingCtrl', RankingCtrl);


  RankingCtrl.$inject = ['Reservatorio','LEGENDCOLORS'];

  /*jshint latedef: nofunc */
  function RankingCtrl(Reservatorio,LEGENDCOLORS) {
  	var vm = this;
  	vm.reservatorios = [];
    vm.selectedUf = { nome: "Todo o semiárido",     sigla: "" };
    vm.orderBy = true;
    vm.loading = false;
    vm.ufs = [
      { nome: "-- Filtrar por Estado --",     sigla: "--" },
      { nome: "Todo o semiárido",     sigla: "" },
      { nome: "Alagoas",              sigla: "AL" },
      { nome: "Bahia",                sigla: "BA" },
      { nome: "Ceará",                sigla: "CE" },
      { nome: "Minas Gerais",         sigla: "MG" },
      { nome: "Paraíba",              sigla: "PB" },
      { nome: "Pernambuco",           sigla: "PE" },
      { nome: "Piauí",                sigla: "PI" },
      { nome: "Rio Grande do Norte",  sigla: "RN" },
      { nome: "Sergipe",              sigla: "SE" }
    ];

    vm.coresReservatorios = LEGENDCOLORS.reservoirsColors;
    vm.corVolume = corVolume;
    vm.tamanhoBarra = tamanhoBarra;
    vm.setOrderby = setOrderby;

    function init() {
      vm.loading = true;
      Reservatorio.info.query(function(response) {
        vm.reservatorios = response;
        vm.loading = false;
      });
    }
    init();

    function corVolume(volume) {
      if (volume === null) {
        return vm.coresReservatorios[5].cor;
      } else {
        var volume_percentual = parseFloat(volume);

        if (volume_percentual  <= 10) {
          return vm.coresReservatorios[0].cor;
        } else if (volume_percentual <= 25) {
          return vm.coresReservatorios[1].cor;
        } else if (volume_percentual <= 50) {
          return vm.coresReservatorios[2].cor;
        } else if (volume_percentual <= 75) {
          return vm.coresReservatorios[3].cor;
        } else {
          return vm.coresReservatorios[4].cor;
        }
      }
  	}

  	function tamanhoBarra(volume) {
  		return Math.min(100, volume);
  	}

    function setOrderby() {
      vm.orderBy = !vm.orderBy;
    }

  }
})();
