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
      previsoes: $resource(RESTAPI.url+'/reservatorios/:id/previsoes', null, {query: {isArray: false}}),
      geolocalizacao: $resource(RESTAPI.url+'/reservatorios', null, {query: {isArray: false}}),
      monitoramento_estado: $resource(RESTAPI.url+'/reservatorio/equivalente/estado/:uf', null, {query: {isArray: false}}),
      estadoEquivalente: $resource(RESTAPI.url+'/reservatorio/equivalente/estado'),
      baciaEquivalente: $resource(RESTAPI.url+'/reservatorio/equivalente/bacia'),
      municipios: $resource(RESTAPI.url+'/municipios/sab'),
      municipioReservatorio: $resource(RESTAPI.url+'/pesquisa/municipio_reservatorio')
    };
    return factory;
  }
})();
