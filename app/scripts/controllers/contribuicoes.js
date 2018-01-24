(function() {
  'use strict';

  angular.module('sabApp')
    .controller('ContribuicoesCtrl', ContribuicoesCtrl);

  ContribuicoesCtrl.$inject = ['$http'];

  /*jshint latedef: nofunc */
  function ContribuicoesCtrl($http) {
    var vm = this;
    vm.gists = [];
    vm.contribuicoes = [];

    function init() {
    }
    init();

  }
})();
