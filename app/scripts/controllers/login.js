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
          $auth.setToken(response.data.access_token);
          $window.localStorage.access_token = response.data.access_token;
          $window.localStorage.refresh_token = response.data.refresh_token;
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
        url: 'http://localhost:5003/logout',
        headers: {'Authorization': 'Bearer ' + $window.localStorage.access_token}
      }).then(function(response) {
        $auth.logout();
      })
    };

    function isAuthenticated() {
      return $auth.isAuthenticated();
    };

  }
})();
