'use strict';

describe('Filter: sabArea', function () {

  // load the filter's module
  beforeEach(module('sabApp'));

  // initialize a new instance of the filter before each test
  var sabArea;
  beforeEach(inject(function ($filter) {
    sabArea = $filter('sabArea');
  }));

  it('should return the input prefixed with "sabArea filter:"', function () {
    var text = 'angularjs';
    expect(sabArea(text)).toBe('sabArea filter: ' + text);
  });

});
