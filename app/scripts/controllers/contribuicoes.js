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
    vm.loading = true;

    function init() {
      $http.get('https://raw.githubusercontent.com/analytics-ufcg/sab/master/contrib.json').then(function(response) {
        vm.gists = response.data.gists;
        vm.gists.forEach(function(gist) {
          $http.get('https://api.github.com/gists/'+gist).then(function(response) {
            vm.contribuicoes.push(response.data);
          });
        });
        vm.loading = false;
      });
    }
    init();

  }
})();
