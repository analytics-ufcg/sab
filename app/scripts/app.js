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
  .module('sabApp', ['ui.router'])

  .config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
    .state('home', {
      url: "/",
      templateUrl: "views/main.html"
    });
    $urlRouterProvider.otherwise('/');
  });
