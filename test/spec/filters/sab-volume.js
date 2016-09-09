'use strict';

describe('Filter: sabVolume', function () {

  // load the filter's module
  beforeEach(module('sabApp'));

  // initialize a new instance of the filter before each test
  var sabVolume;
  beforeEach(inject(function ($filter) {
    sabVolume = $filter('sabVolume');
  }));

  it('should return the input prefixed with "sabVolume filter:"', function () {
    var text = 'angularjs';
    expect(sabVolume(text)).toBe('sabVolume filter: ' + text);
  });

});
