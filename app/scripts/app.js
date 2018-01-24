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
    .module('sabApp', [
      'sabApp.serviceWorker',
      'ngResource',
      'ui.router',
      'ui.bootstrap',
      'openlayers-directive',
      'angularSpinner',
      'angulartics',
      'angulartics.google.analytics',
      '720kb.socialshare',
      'angular-clipboard',
      'angular-ladda',
      'ngFileUpload',
      'satellizer',
      'toastr'])
    .constant('RESTAPI', {
      url: 'http://localhost:5003/api',
      facebookAppID: '543791825832138',
      publicImagesPath: 'https://olhonagua.lsd.ufcg.edu.br/public/'
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

  routeConfig.$inject = ['$stateProvider', '$urlRouterProvider'];
  runConfig.$inject = ['$rootScope', '$state', '$auth', 'ServiceWorker'];

  /*jshint latedef: nofunc */
  function routeConfig($stateProvider, $urlRouterProvider) {
    $stateProvider
    .state('home', {
      url: "/",
      templateUrl: "views/mapa.html",
      controller: "MapaCtrl",
      controllerAs: "ctrl"
    })
    .state('main', {
      url: "/main",
      templateUrl: "views/main.html",
      controller: "MainCtrl",
      controllerAs: "main"
    })
    .state('mapa', {
      url: "/mapa",
      templateUrl: "views/mapa.html",
      controller: "MapaCtrl",
      controllerAs: "ctrl",
      reloadOnSearch: false
    })
    .state('sobre', {
      url: "/sobre",
      templateUrl: "views/sobre.html"
    })
    .state('informese', {
      url: "/informese",
      templateUrl: "views/informese.html"
    })
    .state('contribuicoes', {
      url: "/contribuicoes",
      templateUrl: "views/contribuicoes.html",
      controller: "ContribuicoesCtrl",
      controllerAs: "ctrl"
    })
    .state('parceiros', {
      url: "/parceiros",
      templateUrl: "views/parceiros.html"
    })
    .state('login', {
      url: "/login",
      templateUrl: "views/login.html",
      controller: "LoginCtrl",
      controllerAs: "ctrl"
    })
    .state('atualizar', {
      url: "/atualizar",
      templateUrl: "views/admin-atualizar.html",
      controller: "AdminAtualizarCtrl",
      controllerAs: "ctrl",
      requiredLogin: true
    });
    $urlRouterProvider.otherwise('/');
  }

  function runConfig($rootScope, $state, $auth, ServiceWorker) {
    $rootScope.$state = $state;
    $rootScope.$on('$stateChangeStart', function (event, toState) {
      var requiredLogin = false;
      // check if this state need login
      if (toState && toState.requiredLogin) {
        requiredLogin = true;
      }

      // if yes and if this user is not logged in, redirect him to login page
      if (requiredLogin && !$auth.isAuthenticated()) {
        event.preventDefault();
        $state.go('login');
      }
    });

  	var worker = 'service-worker.js';
  	ServiceWorker.registerWorker(worker);
  }

})();
