(function() {
  'use strict';

  angular.module('sabApp')
    .controller('RankingCtrl', RankingCtrl);


  RankingCtrl.$inject = ['Reservatorio','LEGENDCOLORS'];

  /*jshint latedef: nofunc */
  function RankingCtrl(Reservatorio,LEGENDCOLORS) {
  	var vm = this;
  	vm.reservatorios = Reservatorio.info.query();

	vm.coresReservatorios = LEGENDCOLORS.reservoirsColors;
    vm.corVolume = corVolume;
    vm.tamanhoBarra = tamanhoBarra;

	vm.sortType = 'volume_percentual';
	vm.sortReverse = false;

    function corVolume(volume) {
      if(volume === null) {
        return vm.coresReservatorios[5].cor;
      } else{
        var volume_percentual = parseFloat(volume);

        if (volume_percentual  <= 10){
          return vm.coresReservatorios[0].cor;
        }else if (volume_percentual <= 25){
          return vm.coresReservatorios[1].cor;
        } else if (volume_percentual <= 50){
          return vm.coresReservatorios[2].cor;
        } else if (volume_percentual <= 75){
          return vm.coresReservatorios[3].cor;
        } else{
          return vm.coresReservatorios[4].cor;
        }
      }
  	}

  	function tamanhoBarra(volume) {
  		return Math.min(100, volume);
  	}
  }
})();
