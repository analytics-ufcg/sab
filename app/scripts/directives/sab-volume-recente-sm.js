(function() {
  'use strict';

  angular.module('sabApp')
    .directive('sabVolumeRecenteSm', sabVolumeRecenteSm);

    sabVolumeRecenteSm.$inject = ['$window'];

    /*jshint latedef: nofunc */
    function sabVolumeRecenteSm($window) {
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
            var margin = {top: 10, right: 10, bottom: 10, left: 10},
                width = 100 - margin.left - margin.right,
                height = 60 - margin.top - margin.bottom;

            // Parse the date / time
            var parseDate = d3.time.format("%d/%m/%Y").parse;

            // Set the ranges
            var x = d3.time.scale().range([0, width]);
            var y = d3.scale.linear().range([height, 0]);

            // Define the line
            var valueline = d3.svg.line()
                .interpolate("basis")
                .x(function(d) { return x(d.date); })
                .y(function(d) { return y(d.volume); });
            var valuearea = d3.svg.area()
                .interpolate("basis")
                .x(function(d) { return x(d.date); })
                .y0(height)
                .y1(function(d) { return y(d.volume); });

            // Adds the svg canvas
            var svgFrame = d3.select(element[0])
                .append("svg")
                .attr({
                  'version': '1.1',
                  'viewBox': '0 0 '+(width + margin.left + margin.right)+' '+(height + margin.top + margin.bottom),
                  'width': '100%'});

            var svg = svgFrame.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            var lineSvg = svg.append("g").append("path");
            var areaSvg = svg.append("g").append("path");
            var endCircle = svg.append('circle');
            // var triangle = svg.append('polygon')
            //   .attr("points", "0,0 10,0 5,5");
            // var arrowG = svg.append("g");
            // var arrow = arrowG.append("path").attr({"d": "m3.247127,2.97649c-0.249318,-0.353201 -0.151692,-0.457542 0.217089,-0.23364l3.316589,2.013644c0.221384,0.134411 0.220741,0.352727 0,0.486748l-3.316589,2.013644c-0.369213,0.224165 -0.465573,0.118379 -0.217089,-0.23364l0.164054,-0.232409c0.698206,-0.989125 0.697693,-2.593539 0,-3.581938l-0.164054,-0.232409z"});

            scope.$watch(function(scope) { return scope.monitoramento; }, function(newValue) {
              if ((typeof newValue !== 'undefined') && (newValue.volumes.length !== 0)) {
                draw(newValue);
              }
            });

            // Get the data
            var draw = function(data) {
              var minData = data.volumes;
              minData.forEach(function(d) {
                d.date = parseDate(d.DataInformacao);
                d.volume = +d.VolumePercentual;
              });

              // Scale the range of the data
              var min = d3.min(minData, function(d) { return d.volume; });
              var max = d3.max(minData, function(d) { return d.volume; });
              x.domain(d3.extent(minData, function(d) { return d.date; }));
              y.domain([min, max]);
              // Derive a linear regression
              var regression = data.coeficiente_regressao;

              // Add the valueline path.
              lineSvg
                .style({
                  "fill": "none",
                  "stroke-width": "1",
                  "stroke": color(regression)
                })
                .attr("d", valueline(minData));
              areaSvg
                .style({
                  "fill-opacity": "0.1",
                  "fill": color(regression)
                })
                .attr("d", valuearea(minData));

              endCircle
               .attr('cx', x(minData[minData.length-1].date))
               .attr('cy', y(minData[minData.length-1].volume))
               .attr('r', 1.5)
               .style({
                 "fill": color(regression)
              });

              // triangle
              //   .style({
              //     "fill": color(regression),
              //     "visibility": regression === 0 ? "hidden" : "visible"
              //   })
              //   .attr("transform", rotate(regression));

              // arrowG.attr('transform', 'translate('+(x(minData[minData.length-1].date) - 5)+' '+(y(minData[minData.length-1].volume) - 5)+')');
              // arrow.style('fill', color(regression));

            function color(slope) {
              if (slope > 0) {
                return "#2ecc71";
              } else if (slope < 0){
                return "#e74c3c";
              }
              return "#3498db";
            }

            function rotate(slope) {
              if (slope >= 0) {
                return "translate("+(width / 2)+", "+(height + 10)+"), rotate(-180 5 0)";
              }
              return "translate("+(width / 2)+", "+(height + 5)+")";
            }

          };
        }
      };
    }
})();
