(function() {
  'use strict';

  angular.module('sabApp')
    .directive('sabMapaEquivalente', sabMapaEquivalente);

    sabMapaEquivalente.$inject = ['$window','RESTAPI'];

    /*jshint latedef: nofunc */
    function sabMapaEquivalente($window, RESTAPI) {
      return {
        template: '',
        restrict: 'E',
        scope: {
          mapData: '=',
          setEstado: '&'
        },
        link: function postLink(scope, element) {
          var
            d3 = $window.d3,
            geojson = $window.geojson,
            width = 800,
            height = 400;
          var projection = d3.geo.mercator()
            .scale(1500)
            .translate([width * 1.8, height * -0.20]);
          var path = d3.geo.path()
            .projection(projection);
          var svg = d3.select(element[0])
            .append('svg')
            .attr({
              'version': '1.1',
              'viewBox': '0 0 '+width+' '+height,
              'width': '100%',
              'class': 'recorte-sab-svg'});

          scope.$watch(function(scope) { return scope.mapData; }, function(newValue) {
            if ((typeof newValue !== 'undefined') && !(angular.equals(newValue, {}))) {
              desenhaSab(newValue);
            }
          });

          var desenhaSab = function(mapData) {
            var features = mapData.features;
            svg.selectAll('path')
              .data(features)
            .enter().append('path')
              .attr('d', path)
              .attr("class", "recorte-sab-path")
              .on('mouseover', mouseOver)
              .on('mouseout', mouseOut);


          };

        var mouseOver = function(d) {
            scope.setEstado()(d.properties.UF);
            scope.$apply();
            d3.select(this).attr('class', 'recorte-sab-path-select');


        };

        var mouseOut = function(d) {
            scope.setEstado()("Semiarido");
            scope.$apply();
            svg.selectAll('path').attr('class', 'recorte-sab-path');

        };

        }
      };
    }
})();