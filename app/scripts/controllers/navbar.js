(function() {
  'use strict';

  angular.module('sabApp')
    .controller('NavbarCtrl', NavbarCtrl);

  NavbarCtrl.$inject = ['$state'];

  /*jshint latedef: nofunc */
  function NavbarCtrl($state) {
    var vm = this;
    console.log($state.current);
  }
})();
