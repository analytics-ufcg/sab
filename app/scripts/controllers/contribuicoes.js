(function() {
  'use strict';

  angular.module('sabApp')
    .controller('ContribuicoesCtrl', ContribuicoesCtrl);

  ContribuicoesCtrl.$inject = ['$http'];

  /*jshint latedef: nofunc */
  function ContribuicoesCtrl($http) {
    var vm = this;
    vm.gists = ['9ad40d063e24a024630e8d9f295244bb', '4063269', '4060954', '7607535', '4248145', 'e70e14483fe01eb0a3ea7d1d46a30571', 'e984477a741bc56db5a5'];
    vm.contribuicoes = [];

    function init() {
      vm.gists.forEach(function(gist) {
        $http.get('https://api.github.com/gists/'+gist).then(function(response) {
          vm.contribuicoes.push(response.data);
        });
      });
    }
    init();

  }
})();
