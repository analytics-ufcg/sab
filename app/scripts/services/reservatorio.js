(function() {
  'use strict';

  angular.module('sabApp')
    .factory('Reservatorio', reservatorio);

  reservatorio.$inject = ['RESTAPI','$resource'];

  /*jshint latedef: nofunc */
  function reservatorio(RESTAPI, $resource) {
    var factory = {
      info: $resource(RESTAPI.url+'/reservatorios/:id/info'),
      monitoramento: $resource(RESTAPI.url+'/reservatorios/:id/monitoramento', null, {query: {isArray: false}}),
      geolocalizacao: $resource(RESTAPI.url+'/reservatorios', null, {query: {isArray: false}}),
      estadoEquivalente: $resource(RESTAPI.url+'/reservatorio/equivalente/estado'),
      baciaEquivalente: $resource(RESTAPI.url+'/reservatorio/equivalente/bacia')
    };
    return factory;
  }
})();
