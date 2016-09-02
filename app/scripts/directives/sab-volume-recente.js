(function() {
  'use strict';

  angular.module('sabApp')
    .directive('sabVolumeRecente', sabVolumeRecente);

    sabVolumeRecente.$inject = ['$window'];

    /*jshint latedef: nofunc */
    function sabVolumeRecente($window) {
      return {
        template: '',
        restrict: 'E',
        scope: {
          monitoramento: '='
        },
        link: function postLink(scope, element) {
          var
            d3 = $window.d3;

            // Set the dimensions of the canvas / graph
            var margin = {top: 5, right: 10, bottom: 5, left: 0},
                width = 100 - margin.left - margin.right,
                height = 25 - margin.top - margin.bottom,
                statusWidth = 10,
                statusHeight = 5;

            // Parse the date / time
            var parseDate = d3.time.format("%d/%m/%Y").parse,
                bisectDate = d3.bisector(function(d) { return d.date; }).left;

            var formatTime = d3.time.format("%d/%m/%Y");

            // Set the ranges
            var x = d3.time.scale().range([0, width-statusWidth]);
            var y = d3.scale.linear().range([height, 0]);

            // Define the axes
            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom")
                .ticks(5);

            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left")
                .ticks(2);

            // Define the line
            var valueline = d3.svg.line()
                .interpolate("basis")
                .x(function(d) { return x(d.date); })
                .y(function(d) { return y(d.close); });
            var valuearea = d3.svg.area()
                .interpolate("basis")
                .x(function(d) { return x(d.date); })
                .y0(height)
                .y1(function(d) { return y(d.close); });

            // Adds the svg canvas
            var svg = d3.select(element[0])
                .append("svg")
                .attr({
                  'version': '1.1',
                  'viewBox': '0 0 '+(width + margin.left + margin.right)+' '+(height + margin.top + margin.bottom),
                  'width': '100%'})
                .append("g")
                    .attr("transform",
                          "translate(" + margin.left + "," + margin.top + ")");

            var lineSvg = svg.append("g").append("path");
            var areaSvg = svg.append("g").append("path");
            var endCircle = svg.append('circle');
            var triangule = svg.append('polygon')
              .attr("points", "0,0 "+statusWidth+",0 "+statusHeight+","+statusHeight+"");

            scope.$watch(function(scope) { return scope.monitoramento }, function(newValue, oldValue) {
              if (typeof newValue != 'undefined') {
                draw(newValue);
              }
            });

            // Get the data
            var draw = function(data) {
              data.forEach(function(d) {
                d.date = parseDate(d.DataInformacao);
                d.close = +d.VolumePercentual;
              });

              data.sort(function(a, b) {
                  return a.date - b.date;
              });

              if (data.length >= 100) {
                var minData = data.slice(data.length-100, data.length);
              } else {
                var minData = data;
              }

              // Scale the range of the data
              var min = d3.min(minData, function(d) { return d.close; });
              var max = d3.max(minData, function(d) { return d.close; });
              x.domain(d3.extent(minData, function(d) { return d.date; }));
              y.domain([min, max]);

              // Add the valueline path.
              lineSvg
                .style({
                  "fill": "none",
                  "stroke-width": "1",
                  "stroke": color(minData)
                })
                .attr("d", valueline(minData));
              areaSvg
                .style({
                  "fill-opacity": "0.1",
                  "fill": color(minData)
                })
                .attr("d", valuearea(minData));

              endCircle
               .attr('cx', x(minData[minData.length-1].date))
               .attr('cy', y(minData[minData.length-1].close))
               .attr('r', 1.5)
               .style({
                 "fill": color(minData)
               });

               triangule
                .style({
                  "fill": color(minData)
                })
                .attr("transform", rotate(minData));

            function color(data) {
              var ultimo = minData[minData.length-1].close;
              var penultimo = minData[minData.length-2].close;
              if (ultimo >= penultimo) {
                return "#2ecc71"; // Vermelho
              } else {
                return "#e74c3c"; // Verde
              }
            }
            function rotate(data) {
              var ultimo = minData[minData.length-1].close;
              var penultimo = minData[minData.length-2].close;
              if (ultimo >= penultimo) {
                return "translate("+(width-(statusWidth/2))+", "+((height/2)+(statusHeight/2))+"), rotate(-180 5 0)";
              } else {
                return "translate("+(width-(statusWidth/2))+", "+((height/2)-(statusHeight/2))+")";
              }
            }

          }
        }
      }
    }
})();
