(function() {
  'use strict';

  angular.module('sabApp')
    .factory('ReservatorioEquivalente', reservatorioEquivalente);

  reservatorioEquivalente.$inject = ['RESTAPI','$resource'];

  /*jshint latedef: nofunc */
  function reservatorioEquivalente(RESTAPI, $resource) {
    var factory = {
      estadoEquivalente: $resource(RESTAPI.url+'/reservatorio/equivalente/estado'),
      baciaEquivalente: $resource(RESTAPI.url+'/reservatorio/equivalente/bacia')
    };
    return factory;
  }
})();
