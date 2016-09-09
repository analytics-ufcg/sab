(function() {
  'use strict';

  angular.module('sabApp')
    .filter('sabVolume', sabVolume);

    sabVolume.$inject = [];

    /*jshint latedef: nofunc */
    function sabVolume() {
      return function (input) {
        if (!input) return;
        var newInput = input.replace(".", ",");
        return newInput+" hm³";
      };
    }
})();
