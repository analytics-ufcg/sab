(function() {
  'use strict';

  angular.module('sabApp')
    .controller('ContribuicaoCtrl', ContribuicaoCtrl);

  ContribuicaoCtrl.$inject = ['$http', '$stateParams', '$sce', 'RESTAPI'];

  /*jshint latedef: nofunc */
  function ContribuicaoCtrl($http, $stateParams, $sce, RESTAPI) {
    var vm = this;
    vm.gistId = $stateParams.id;
    vm.contribuicao = {};
    vm.gistUrl = '';

    function init() {
      $http.get('https://api.github.com/gists/'+vm.gistId).then(function(response) {
        vm.contribuicao = response.data;
        vm.gistUrl = $sce.trustAsResourceUrl(RESTAPI.url+'/raw/'+vm.gistId);
      });
    }
    init();

  }
})();
