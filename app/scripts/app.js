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
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider', '$urlRouterProvider'];

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
})();
