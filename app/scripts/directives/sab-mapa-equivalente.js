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
          mapSabData: '=',
          setEstado: '&',
          mapBrData: '='
        },
        link: function postLink(scope, element) {

          var margin = {top: 1, right: 1, bottom: 1, left: 1},
            d3 = $window.d3,
            geojson = $window.geojson,
            width = 600 - margin.left - margin.right,
            height = 300 - margin.top - margin.bottom;
          var projection = d3.geo.mercator()
            .scale(1000)
            .translate([width * 1.8, height * -0.10]);
          var path = d3.geo.path()
            .projection(projection);
          var svg = d3.select(element[0])
            .append('svg')
            .attr({
              'version': '1.1',
              'viewBox': '0 0 '+(width+ margin.left + margin.right)+' '+(height+ margin.top + margin.bottom),
              'width': '100%',
              'class': 'recorte-sab-svg'});
          var stateSelected = "Semiarido";

          scope.$watch(function(scope) { return scope.mapBrData; }, function(newValue) {
            if (((typeof scope.mapSabData !== 'undefined') && !(angular.equals(scope.mapSabData, {}))) && 
              ((typeof newValue !== 'undefined') && !(angular.equals(newValue, {})))) {
              Brazil(newValue);
              desenhaSab(scope.mapSabData);
            }
          });

          var desenhaSab = function(mapSabData) {
            var features = mapSabData.features;
            svg.selectAll('.recorte-sab-path')
              .data(features)
            .enter().append('path')
              .attr('d', path)
              .attr("class", "recorte-sab-path")
              .on('click', clickState);
          };

          var Brazil = function(mapBrData) {
            var features = mapBrData.features;
            svg.selectAll('.pais-path')
              .data(features)
            .enter().append('path')
              .attr('d', path)
              .attr("class", "pais-path");
          };

        var clickState = function(d) {
          svg.selectAll('.recorte-sab-path-select').attr('class', 'recorte-sab-path');
          
          if (d.properties.UF === stateSelected){
            stateSelected = "Semiarido";
          } else{
            stateSelected = d.properties.UF;
            d3.select(this).attr('class', 'recorte-sab-path-select');
          }
            scope.setEstado()(stateSelected);
            scope.$apply();
        };

        }
      };
    }
})();