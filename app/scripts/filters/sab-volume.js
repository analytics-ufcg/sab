(function() {
  'use strict';

  angular.module('sabApp')
    .filter('sabVolume', sabVolume);

    sabVolume.$inject = [];

    /*jshint latedef: nofunc */
    function sabVolume() {
      return function (input) {
        if (!input) {return;}
        var newInput = parseFloat(input).toLocaleString('pt-BR', {minimumFractionDigits: 2,maximumFractionDigits: 2});
        return newInput+" hm³";
      };
    }
})();
