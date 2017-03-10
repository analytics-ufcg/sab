(function() {
  'use strict';

  angular.module('sabApp')
    .filter('sabVolume', sabVolume);

    sabVolume.$inject = [];

    /*jshint latedef: nofunc */
    function sabVolume() {
      return function (input, decimais) {
        if (!input) {return;}
        if (decimais == undefined) {
          decimais = 2;
        }
        var newInput = parseFloat(input).toLocaleString('pt-BR', {minimumFractionDigits: decimais, maximumFractionDigits: decimais});
        return newInput+" hm³";
      };
    }
})();
