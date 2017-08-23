(function() {
  'use strict';

  angular.module('sabApp')
    .filter('sabVolume', sabVolume);

    sabVolume.$inject = [];

    /*jshint latedef: nofunc */
    function sabVolume() {
      return function (input, decimais, ocultarUnidade) {
        if (!input) {return;}
        if (decimais == undefined) {
          decimais = 1;
        }
        var newInput = parseFloat(input).toLocaleString('pt-BR', {minimumFractionDigits: decimais, maximumFractionDigits: decimais});
        if (ocultarUnidade) {
          return newInput;
        }
        return newInput+" hm³";
      };
    }
})();
