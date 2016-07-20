'use strict';

describe('Directive: sabMapa', function () {

  // load the directive's module
  beforeEach(module('sabApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<sab-mapa></sab-mapa>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the sabMapa directive');
  }));
});
