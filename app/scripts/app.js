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
      reservoirsColors: [
          {cor: '#ff2222', texto: 'Abaixo de 10', textoAlternativo: 'abaixo de 10'},
          {cor: '#ff8f61', texto: '10 - 25', textoAlternativo: 'entre 10 e 25'},
          {cor: '#fffc9f', texto: '25 - 50', textoAlternativo: 'entre 25 e 50'},
          {cor: '#99bfcf', texto: '50 - 75', textoAlternativo: 'entre 50 e 75'},
          {cor: '#3381ff', texto: 'Acima de 75', textoAlternativo: 'acima de 75'},
          {cor: '#ffffff', texto: 'Sem informação'}
        ]
    })
    .config(routeConfig)
    .run(runConfig);

  routeConfig.$inject = ['$stateProvider', '$urlRouterProvider','$locationProvider'];

  runConfig.$inject = ['$rootScope', '$state'];

  /*jshint latedef: nofunc */
  function routeConfig($stateProvider, $urlRouterProvider, $locationProvider) {
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
    })
    .state('sobre', {
      url: "/sobre",
      templateUrl: "views/sobre.html"
    })
    .state('informese', {
      url: "/informese",
      templateUrl: "views/informese.html"
    })
    .state('parceiros', {
      url: "/parceiros",
      templateUrl: "views/parceiros.html"
    });
    $urlRouterProvider.otherwise('/');
    $locationProvider.html5Mode(true);
  }

  function runConfig($rootScope, $state) {
    $rootScope.$state = $state;
  }

})();
