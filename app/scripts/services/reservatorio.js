(function() {
  'use strict';

  angular.module('sabApp')
    .factory('Reservatorio', reservatorio);

  reservatorio.$inject = ['RESTAPI','$resource'];

  /*jshint latedef: nofunc */
  function reservatorio(RESTAPI, $resource) {
    var
      info = $resource(RESTAPI.url+'/reservatorios/:id/info'),
      monitoramento = $resource(RESTAPI.url+'/reservatorios/12172/monitoramento'),
      factory = {
        info: info,
        monitoramento: monitoramento
      }
    return factory;
  }
})();
