(function() {
  'use strict';

  angular.module('sabApp')
    .directive('sabLegendaCoresReservatorios', sabLegendaCoresReservatorios);

    sabLegendaCoresReservatorios.$inject = ['$window'];

    /*jshint latedef: nofunc */
    function sabLegendaCoresReservatorios($window) {
      return {
        template: '',
        restrict: 'E',
        scope: {
          cores: '='
        },
        link: function postLink(scope, element) {
          var d3 = $window.d3;

          // Set the dimensions of the canvas / graph
          var margin = {top: 15, right: 5, bottom: 5, left: 10},
              width = 90 - margin.left - margin.right,
              height = 85 - margin.top - margin.bottom,
              circleHeight = 5,
              circlePadding = 3;

          var svg = d3.select(element[0])
            .append("svg")
            .attr({
              'version': '1.1',
              'viewBox': '0 0 '+(width + margin.left + margin.right)+' '+(height + margin.top + margin.bottom),
              'width': '100%',
              'class': 'legend'});
          var focus = svg.append("g")
            .attr("class", "focus")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          draw(scope.cores);

          function draw(cores) {
            cores.forEach(function(cor, i) {
              focus.append("circle")
                .attr("class", "category")
                .attr("r", circleHeight)
                .attr("cx", 0)
                .attr("cy", i*((circleHeight*2)+circlePadding))
                .attr("fill", cor.cor);
              focus.append("text")
                .attr("class", "text")
                .attr("font-size", "8px")
                .attr("fill", "#fff")
                .attr("alignment-baseline", "middle")
                .attr("transform", "translate(12," + (i*((circleHeight*2)+circlePadding)+1) + ")")
                .text(cor.texto);
            });
          }
        }
      };
    }
})();
