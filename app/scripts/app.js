(function() {
  'use strict';

  /**
   * @ngdoc overview
   * @name sabApp
   * @description
   * # sabApp
   *
   * Main module of the application.
   */
  angular
    .module('sabApp', ['ngResource', 'ui.router', 'ui.bootstrap', 'openlayers-directive', 'angularSpinner'])
    .constant('RESTAPI', {
      url: 'http://localhost:5003/api'
    })
    .constant('LEGENDCOLORS', {
      coresReservatorios: [
          {cor: '#ff2222', texto: 'Abaixo de 10', texto_alternativo: 'abaixo de 10'},
          {cor: '#ff8f61', texto: '10 - 25', texto_alternativo: 'entre 10 e 25'},
          {cor: '#fffc9f', texto: '25 - 50', texto_alternativo: 'entre 25 e 50'},
          {cor: '#99bfcf', texto: '50 - 75', texto_alternativo: 'entre 50 e 75'},
          {cor: '#3381ff', texto: 'Acima de 75', texto_alternativo: 'acima de 75'},
          {cor: '#ffffff', texto: 'Sem informação'}
        ]
    })
    .config(routeConfig)
    .run(runConfig);

  routeConfig.$inject = ['$stateProvider', '$urlRouterProvider'];

  runConfig.$inject = ['$rootScope', '$state'];

  /*jshint latedef: nofunc */
  function routeConfig($stateProvider, $urlRouterProvider) {
    $stateProvider
    .state('home', {
      url: "/",
      templateUrl: "views/main.html",
      controller: "MainCtrl",
      controllerAs: "main"
    })
    .state('mapa', {
      url: "/mapa",
      templateUrl: "views/mapa.html",
      controller: "MapaCtrl",
      controllerAs: "ctrl"
    });
    $urlRouterProvider.otherwise('/');
  }

  function runConfig($rootScope, $state) {
    $rootScope.$state = $state;
  }

})();
