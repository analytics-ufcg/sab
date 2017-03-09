(function() {
  'use strict';

  angular.module('sabApp')
    .filter('sabArea', sabArea);

    sabArea.$inject = [];

    /*jshint latedef: nofunc */
    function sabArea() {
      return function (input) {
        if (!input) {return;}
        var newInput = (input/1000000).toLocaleString('pt-BR', {minimumFractionDigits: 2,maximumFractionDigits: 2});
        
        return newInput+" km²";
      };
    }
})();
