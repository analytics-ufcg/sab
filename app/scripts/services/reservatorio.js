(function() {
  'use strict';

  angular.module('sabApp')
    .factory('Reservatorio', reservatorio);

  reservatorio.$inject = ['RESTAPI','$resource'];

  /*jshint latedef: nofunc */
  function reservatorio(RESTAPI, $resource) {
    var factory = $resource(RESTAPI.url+'/info_reservatorios');
    return factory;
  }
})();