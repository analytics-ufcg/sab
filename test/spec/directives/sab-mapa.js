'use strict';

describe('Directive: sabMapa', function () {

  // load the directive's module
  beforeEach(module('sabApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('deve ter um elemento svg', inject(function ($compile) {
    var element = angular.element('<svg></svg>');
    expect(element).toBeDefined();
  }));
});
