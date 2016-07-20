'use strict';

describe('Service: reservatorio', function () {

  // load the service's module
  beforeEach(module('sabApp'));

  // instantiate service
  var reservatorio;
  beforeEach(inject(function (_reservatorio_) {
    reservatorio = _reservatorio_;
  }));

  it('should do something', function () {
    expect(!!reservatorio).toBe(true);
  });

});
