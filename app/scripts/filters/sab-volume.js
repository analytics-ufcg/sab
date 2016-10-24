(function() {
  'use strict';

  angular.module('sabApp')
    .filter('sabVolume', sabVolume);

    sabVolume.$inject = [];

    /*jshint latedef: nofunc */
    function sabVolume() {
      return function (input) {
        if (!input) {return;}
        var inputRound = parseFloat(input).toFixed(2).toString();
        var newInput = inputRound.replace(".", ",");
        return newInput+" hm³";
      };
    }
})();
