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
          monitoramento: '=',
          previsoes: '=',
          data: '='
        },
        link: function postLink(scope, element) {
          var
            d3 = $window.d3;

            // Set the dimensions of the canvas / graph
            var margin = {top: 5, right: 5, bottom: 5, left: 5},
                width = 200 - margin.left - margin.right,
                height = 30 - margin.top - margin.bottom;

            // Parse the date / time
            var parseDate = d3.time.format("%d/%m/%Y").parse;

            // Set the ranges
            var x1 = d3.time.scale().range([0, width/2]);
            var x2 = d3.time.scale().range([width/2, width]);
            var y = d3.scale.linear().range([height, 0]);

            // Define the line
            var valueline1 = d3.svg.line()
                .interpolate("basis")
                .x(function(d) { return x1(d.date); })
                .y(function(d) { return y(d.volume); });
            var valueline2 = d3.svg.line()
                .interpolate("basis")
                .x(function(d) { return x2(d.date); })
                .y(function(d) { return y(d.volume); });
            var valuearea = d3.svg.area()
                .interpolate("basis")
                .x(function(d) { return x1(d.date); })
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
            var gLines = svg.append("g").attr("class", "lines");
            var gAxis = svg.append("g").attr("class", "axis");
            var gDetails = svg.append("g").attr("class", "details");

            var line1Svg = gLines.append("path");
            var line2Svg = gLines.append("path");
            var line3Svg = gLines.append("path");
            var areaSvg = gLines.append("path");
            var dayStroke = gDetails.append('line');
            var endCircle = gDetails.append('circle');
            // var triangle = svg.append('polygon')
            //   .attr("points", "0,0 10,0 5,5");
            // var arrowG = svg.append("g");
            // var arrow = arrowG.append("path").attr({"d": "m3.247127,2.97649c-0.249318,-0.353201 -0.151692,-0.457542 0.217089,-0.23364l3.316589,2.013644c0.221384,0.134411 0.220741,0.352727 0,0.486748l-3.316589,2.013644c-0.369213,0.224165 -0.465573,0.118379 -0.217089,-0.23364l0.164054,-0.232409c0.698206,-0.989125 0.697693,-2.593539 0,-3.581938l-0.164054,-0.232409z"});

            scope.$watchCollection(function(scope) { return [scope.monitoramento, scope.previsoes, scope.data]; }, function(newValue) {
              if ((typeof newValue[0] !== 'undefined') && (newValue[0].volumes.length !== 0) && (typeof newValue[1] !== 'undefined') && (typeof newValue[2] !== 'undefined')) {
                draw(newValue[0], newValue[1], newValue[2]);
              }
            });

            // Get the data
            var draw = function(monitoramento, previsoes, data) {
              var
                volumes = monitoramento.volumes,
                regression = monitoramento.coeficiente_regressao,
                previsaoOutorga = previsoes.outorga,
                previsaoRetirada = previsoes.previsao,
                volumeMorto = +previsoes.volume_morto,
                dataBase = parseDate(data);

              volumes.forEach(function(d) {
                d.date = parseDate(d.DataInformacao);
                d.volume = +d.Volume;
              });

              previsaoRetirada.volumesD = [];
              previsaoRetirada.volumes.forEach(function(d, i) {
                previsaoRetirada.volumesD.push({
                  date: d3.time.day.offset(dataBase, i+1),
                  volume: +d
                });
              });
              previsaoOutorga.volumesD = [];
              previsaoOutorga.volumes.forEach(function(d, i) {
                previsaoOutorga.volumesD.push({
                  date: d3.time.day.offset(dataBase, i+1),
                  volume: +d
                });
              });

              // Scale the range of the data
              var allVolumes = [volumes, previsaoRetirada.volumesD, previsaoOutorga.volumesD];
              var min = d3.min(allVolumes.map(function(v) {
                return d3.min(v, function(d) { return d.volume; });
              }));
              var max = d3.max(allVolumes.map(function(v) {
                return d3.max(v, function(d) { return d.volume; });
              }));
              x1.domain(d3.extent(volumes, function(d) { return d.date; }));
              x2.domain([dataBase, d3.time.day.offset(dataBase, 180)]);
              y.domain([min, max]);

              // Add the valueline path.
              line1Svg
                .style({
                  "fill": "none",
                  "stroke-width": "1",
                  "stroke": color(regression)
                })
                .attr("class", "tendencia")
                .attr("d", valueline1(volumes));
              line2Svg
                .style({
                  "fill": "none",
                  "stroke-width": "0.8",
                  "stroke": "rgb(177, 177, 177)"
                })
                .attr("class", "retirada")
                .attr("d", valueline2(previsaoRetirada.volumesD));
              line3Svg
                .style({
                  "fill": "none",
                  "stroke-width": "0.8",
                  "stroke": "rgb(195, 195, 195)"
                })
                .attr("class", "outorga")
                .attr("d", valueline2(previsaoOutorga.volumesD));
              areaSvg
                .style({
                  "fill-opacity": "0.1",
                  "fill": color(regression)
                })
                .attr("d", valuearea(volumes));

              // Details
              dayStroke
                .attr('x1', x1(volumes[volumes.length-1].date))
                .attr('y1', -margin.top)
                .attr('x2', x1(volumes[volumes.length-1].date))
                .attr('y2', y(min)+margin.bottom)
                .style({
                  "stroke": "gray",
                  "stroke-width": "0.5",
                  "stroke-dasharray": "4,2"
                });
              endCircle
                .attr('cx', x1(volumes[volumes.length-1].date))
                .attr('cy', y(volumes[volumes.length-1].volume))
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

              // arrowG.attr('transform', 'translate('+(x(volumes[volumes.length-1].date) - 5)+' '+(y(volumes[volumes.length-1].volume) - 5)+')');
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
