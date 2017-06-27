(function() {
  'use strict';

  angular.module('sabApp')
    .controller('LoginCtrl', LoginCtrl);

  LoginCtrl.$inject = ['$auth', '$state', '$window', '$rootScope', '$http'];

  /*jshint latedef: nofunc */
  function LoginCtrl($auth, $state, $window, $rootScope, $http) {
    var vm = this;
    vm.user = {
      email: '',
      password: ''
    }
    vm.login = login;
    vm.logout = logout;
    vm.isAuthenticated = isAuthenticated;

    function init() {
    }
    init();

    function login() {
      $auth.login(vm.user, {
        method: 'POST',
        url: 'http://localhost:5003/login',
        headers: {'Content-Type': 'application/json'},
        data: 'email='+vm.user.email+'&password='+vm.user.password
      }).then(function(response) {
        console.log(response.data);
        if (response.data.Authorized === true) {
          $auth.setToken('token');
          $window.localStorage.token = response.data;
          $window.localStorage.currentUser = 'insa';
          $rootScope.currentUser = JSON.parse('{}');
          $state.go('atualizar');
        } else {
          console.log("Autenticação inválida");
        }
      })
      .catch(function(response) {
        console.log(response);
      });
    }

    function logout() {
      $http({
        method: 'POST',
        url: 'http://localhost:5003/logout'
      }).then(function(response) {
        $auth.logout();
      })
    };

    function isAuthenticated() {
      return $auth.isAuthenticated();
    };

  }
})();
