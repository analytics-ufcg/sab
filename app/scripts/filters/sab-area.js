(function() {
  'use strict';

  angular.module('sabApp')
    .filter('sabArea', sabArea);

    sabArea.$inject = [];

    /*jshint latedef: nofunc */
    function sabArea() {
      return function (input) {
        if (!input) {return;}
        var newInput = (input/1000000).toFixed(2);
        newInput = newInput.replace(".", ",");
        return newInput+" km²";
      };
    }
})();
