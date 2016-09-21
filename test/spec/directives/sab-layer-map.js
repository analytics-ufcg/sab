'use strict';

describe('Directive: sabLayerMap', function () {

  // load the directive's module
  beforeEach(module('sabApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<sab-layer-map></sab-layer-map>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the sabLayerMap directive');
  }));
});
